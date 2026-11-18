package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizMigrationDualRunSaveRequest;
import com.huaweicloud.plm.system.dto.BizMigrationReconcileSaveRequest;
import com.huaweicloud.plm.system.dto.OaMigrationQuery;
import com.huaweicloud.plm.system.entity.OaMigrationDualRun;
import com.huaweicloud.plm.system.entity.OaMigrationReconcile;
import com.huaweicloud.plm.system.mapper.OaMigrationDualRunMapper;
import com.huaweicloud.plm.system.mapper.OaMigrationReconcileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 迁移对账与双跑对照（OA-DEV-103/104）：按对象统计源/目标/成功/失败/跳过/差异数量与处理结论；
 * 关键流程在新旧系统的审批人、路径、计算字段、通知与最终结果对照。
 * 差异容差与双跑启用开关均为可配置项（oa.migration.diff.tolerance、oa.migration.dual.run.enabled）。
 */
@Service
@RequiredArgsConstructor
public class OaMigrationReconcileService {

    private static final String RECONCILE_PENDING = "PENDING";
    private static final String RECONCILE_CONFIRMED = "CONFIRMED";
    private static final String RECONCILE_EXCEPTION = "EXCEPTION";
    private static final String RESULT_PENDING = "PENDING";
    private static final String RESULT_MATCH = "MATCH";
    private static final String RESULT_DIFF = "DIFF";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaMigrationReconcileMapper reconcileMapper;
    private final OaMigrationDualRunMapper dualRunMapper;
    private final OaBizFlowSupport flowSupport;

    // ================= 迁移对账 =================

    public PageResult<OaMigrationReconcile> pageReconciles(OaMigrationQuery query) {
        Page<OaMigrationReconcile> page = query.toPage();
        reconcileMapper.selectPage(page, Wrappers.<OaMigrationReconcile>lambdaQuery()
                .eq(StringUtils.hasText(query.getObjectCode()), OaMigrationReconcile::getObjectCode, query.getObjectCode())
                .eq(StringUtils.hasText(query.getReconcileStatus()), OaMigrationReconcile::getReconcileStatus, query.getReconcileStatus())
                .eq(query.getBatchId() != null, OaMigrationReconcile::getBatchId, query.getBatchId())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaMigrationReconcile::getReconcileNo, query.getKeyword()).or()
                        .like(OaMigrationReconcile::getObjectCode, query.getKeyword()).or()
                        .like(OaMigrationReconcile::getBatchNo, query.getKeyword()))
                .orderByDesc(OaMigrationReconcile::getId));
        return PageResult.of(page);
    }

    public OaMigrationReconcile detailReconcile(Long id) {
        return requireReconcile(id);
    }

    @Transactional
    public Long saveReconcile(Long id, BizMigrationReconcileSaveRequest request) {
        OaMigrationReconcile entity;
        if (id == null) {
            entity = new OaMigrationReconcile();
            entity.setReconcileNo(StringUtils.hasText(request.getReconcileNo())
                    ? request.getReconcileNo() : flowSupport.nextBizNo("MRC"));
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireReconcile(id);
            if (StringUtils.hasText(request.getReconcileNo())) {
                entity.setReconcileNo(request.getReconcileNo());
            }
        }
        entity.setBatchId(request.getBatchId());
        entity.setBatchNo(request.getBatchNo());
        entity.setObjectCode(request.getObjectCode());
        entity.setSourceCount(request.getSourceCount() == null ? 0L : request.getSourceCount());
        entity.setTargetCount(request.getTargetCount() == null ? 0L : request.getTargetCount());
        entity.setSuccessCount(request.getSuccessCount() == null ? 0L : request.getSuccessCount());
        entity.setFailCount(request.getFailCount() == null ? 0L : request.getFailCount());
        entity.setSkipCount(request.getSkipCount() == null ? 0L : request.getSkipCount());
        long diff = request.getDiffCount() == null
                ? entity.getSourceCount() - entity.getSuccessCount() - entity.getSkipCount()
                : request.getDiffCount();
        if (diff < 0) {
            diff = 0;
        }
        entity.setDiffCount(diff);
        entity.setDiffReason(request.getDiffReason());
        entity.setConclusion(request.getConclusion());
        long tolerance = flowSupport.configInt("oa.migration.diff.tolerance", 0);
        if (StringUtils.hasText(request.getReconcileStatus())) {
            entity.setReconcileStatus(request.getReconcileStatus());
        } else {
            entity.setReconcileStatus(diff <= tolerance ? RECONCILE_CONFIRMED : RECONCILE_EXCEPTION);
        }
        entity.setReportTime(parseTimestamp(request.getReportTime()));
        entity.setRemark(request.getRemark());
        if (id == null) {
            reconcileMapper.insert(entity);
        } else {
            reconcileMapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 业务方确认对账结论：差异为零或有批准例外清单时置为通过。 */
    @Transactional
    public OaMigrationReconcile confirmReconcile(Long id, String conclusion) {
        OaMigrationReconcile entity = requireReconcile(id);
        if (RECONCILE_CONFIRMED.equals(entity.getReconcileStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "对账已通过，无需重复确认");
        }
        entity.setReconcileStatus(RECONCILE_CONFIRMED);
        if (StringUtils.hasText(conclusion)) {
            entity.setConclusion(conclusion);
        }
        if (entity.getReportTime() == null) {
            entity.setReportTime(LocalDateTime.now());
        }
        reconcileMapper.updateById(entity);
        return entity;
    }

    @Transactional
    public void deleteReconcile(Long id) {
        requireReconcile(id);
        reconcileMapper.deleteById(id);
    }

    /** 对账汇总报告：按对象输出统计与结论。 */
    public Map<String, Object> reconcileReport() {
        List<OaMigrationReconcile> all = reconcileMapper.selectList(Wrappers.<OaMigrationReconcile>lambdaQuery()
                .orderByAsc(OaMigrationReconcile::getObjectCode));
        List<Map<String, Object>> items = new ArrayList<>();
        long diffObjectCount = 0L;
        for (OaMigrationReconcile item : all) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("reconcileNo", item.getReconcileNo());
            row.put("objectCode", item.getObjectCode());
            row.put("sourceCount", item.getSourceCount());
            row.put("targetCount", item.getTargetCount());
            row.put("successCount", item.getSuccessCount());
            row.put("failCount", item.getFailCount());
            row.put("skipCount", item.getSkipCount());
            row.put("diffCount", item.getDiffCount());
            row.put("reconcileStatus", item.getReconcileStatus());
            items.add(row);
            if (item.getDiffCount() != null && item.getDiffCount() > 0) {
                diffObjectCount++;
            }
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", all.size());
        result.put("diffObjectCount", diffObjectCount);
        result.put("diffTolerance", flowSupport.configInt("oa.migration.diff.tolerance", 0));
        result.put("items", items);
        return result;
    }

    // ================= 双跑对照 =================

    public PageResult<OaMigrationDualRun> pageDualRuns(OaMigrationQuery query) {
        Page<OaMigrationDualRun> page = query.toPage();
        dualRunMapper.selectPage(page, Wrappers.<OaMigrationDualRun>lambdaQuery()
                .eq(StringUtils.hasText(query.getCompareResult()), OaMigrationDualRun::getCompareResult, query.getCompareResult())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaMigrationDualRun::getDualNo, query.getKeyword()).or()
                        .like(OaMigrationDualRun::getProcessCode, query.getKeyword()).or()
                        .like(OaMigrationDualRun::getProcessName, query.getKeyword()).or()
                        .like(OaMigrationDualRun::getBizKey, query.getKeyword()).or()
                        .like(OaMigrationDualRun::getOldInstanceNo, query.getKeyword()))
                .orderByDesc(OaMigrationDualRun::getId));
        return PageResult.of(page);
    }

    public OaMigrationDualRun detailDualRun(Long id) {
        return requireDualRun(id);
    }

    @Transactional
    public Long saveDualRun(Long id, BizMigrationDualRunSaveRequest request) {
        OaMigrationDualRun entity;
        if (id == null) {
            entity = new OaMigrationDualRun();
            entity.setDualNo(StringUtils.hasText(request.getDualNo())
                    ? request.getDualNo() : flowSupport.nextBizNo("MDR"));
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireDualRun(id);
            if (StringUtils.hasText(request.getDualNo())) {
                entity.setDualNo(request.getDualNo());
            }
        }
        entity.setProcessCode(request.getProcessCode());
        entity.setProcessName(request.getProcessName());
        entity.setBizKey(request.getBizKey());
        entity.setNewInstanceId(request.getNewInstanceId());
        entity.setOldInstanceNo(request.getOldInstanceNo());
        entity.setApproverDiff(request.getApproverDiff());
        entity.setPathDiff(request.getPathDiff());
        entity.setFieldDiff(request.getFieldDiff());
        entity.setNotifyDiff(request.getNotifyDiff());
        entity.setResultDiff(request.getResultDiff());
        entity.setConclusion(request.getConclusion());
        entity.setRunTime(parseTimestamp(request.getRunTime()));
        if (StringUtils.hasText(request.getCompareResult())) {
            entity.setCompareResult(request.getCompareResult());
        } else {
            boolean hasDiff = hasText(request.getApproverDiff()) || hasText(request.getPathDiff())
                    || hasText(request.getFieldDiff()) || hasText(request.getNotifyDiff())
                    || hasText(request.getResultDiff());
            entity.setCompareResult(hasDiff ? RESULT_DIFF : RESULT_MATCH);
        }
        if (id == null) {
            dualRunMapper.insert(entity);
        } else {
            dualRunMapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 重新比对新旧流程差异项并给出对照结果。 */
    @Transactional
    public OaMigrationDualRun compareDualRun(Long id) {
        OaMigrationDualRun entity = requireDualRun(id);
        boolean hasDiff = hasText(entity.getApproverDiff()) || hasText(entity.getPathDiff())
                || hasText(entity.getFieldDiff()) || hasText(entity.getNotifyDiff())
                || hasText(entity.getResultDiff());
        entity.setCompareResult(hasDiff ? RESULT_DIFF : RESULT_MATCH);
        entity.setRunTime(LocalDateTime.now());
        dualRunMapper.updateById(entity);
        return entity;
    }

    @Transactional
    public void deleteDualRun(Long id) {
        requireDualRun(id);
        dualRunMapper.deleteById(id);
    }

    /** 双跑对照汇总。 */
    public Map<String, Object> dualRunSummary() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", dualRunMapper.selectCount(null));
        result.put("pending", dualRunMapper.selectCount(Wrappers.<OaMigrationDualRun>lambdaQuery()
                .eq(OaMigrationDualRun::getCompareResult, RESULT_PENDING)));
        result.put("matched", dualRunMapper.selectCount(Wrappers.<OaMigrationDualRun>lambdaQuery()
                .eq(OaMigrationDualRun::getCompareResult, RESULT_MATCH)));
        result.put("diff", dualRunMapper.selectCount(Wrappers.<OaMigrationDualRun>lambdaQuery()
                .eq(OaMigrationDualRun::getCompareResult, RESULT_DIFF)));
        result.put("dualRunEnabled", flowSupport.configBoolean("oa.migration.dual.run.enabled", true));
        return result;
    }

    public OaMigrationReconcile requireReconcile(Long id) {
        OaMigrationReconcile entity = reconcileMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "迁移对账记录不存在: " + id);
        }
        return entity;
    }

    public OaMigrationDualRun requireDualRun(Long id) {
        OaMigrationDualRun entity = dualRunMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "双跑对照记录不存在: " + id);
        }
        return entity;
    }

    private boolean hasText(String value) {
        return StringUtils.hasText(value);
    }

    private LocalDateTime parseTimestamp(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return LocalDateTime.parse(value.trim(), TS_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
