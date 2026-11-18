package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizMigrationBatchSaveRequest;
import com.huaweicloud.plm.system.dto.BizMigrationCleanLogSaveRequest;
import com.huaweicloud.plm.system.dto.BizMigrationCleanRuleSaveRequest;
import com.huaweicloud.plm.system.dto.OaMigrationQuery;
import com.huaweicloud.plm.system.entity.OaMigrationBatch;
import com.huaweicloud.plm.system.entity.OaMigrationCleanLog;
import com.huaweicloud.plm.system.entity.OaMigrationCleanRule;
import com.huaweicloud.plm.system.mapper.OaMigrationBatchMapper;
import com.huaweicloud.plm.system.mapper.OaMigrationCleanLogMapper;
import com.huaweicloud.plm.system.mapper.OaMigrationCleanRuleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 迁移批次与数据清洗（OA-DEV-097/098/100/101）：抽取/全量/增量试迁批次、快照校验、清洗规则与清洗日志。
 * 清洗日志同时记录原值与清洗值；是否允许覆盖原始数据由配置 oa.migration.clean.overwrite.source 控制（默认不覆盖）。
 */
@Service
@RequiredArgsConstructor
public class OaMigrationBatchService {

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_RUNNING = "RUNNING";
    private static final String STATUS_SUCCESS = "SUCCESS";
    private static final String STATUS_FAILED = "FAILED";
    private static final String STATUS_PARTIAL = "PARTIAL";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaMigrationBatchMapper batchMapper;
    private final OaMigrationCleanRuleMapper cleanRuleMapper;
    private final OaMigrationCleanLogMapper cleanLogMapper;
    private final OaBizFlowSupport flowSupport;

    // ================= 迁移批次 =================

    public PageResult<OaMigrationBatch> pageBatches(OaMigrationQuery query) {
        Page<OaMigrationBatch> page = query.toPage();
        batchMapper.selectPage(page, Wrappers.<OaMigrationBatch>lambdaQuery()
                .eq(StringUtils.hasText(query.getBatchType()), OaMigrationBatch::getBatchType, query.getBatchType())
                .eq(StringUtils.hasText(query.getBatchStatus()), OaMigrationBatch::getBatchStatus, query.getBatchStatus())
                .eq(StringUtils.hasText(query.getObjectCode()), OaMigrationBatch::getObjectCode, query.getObjectCode())
                .ge(query.getStartDate() != null, OaMigrationBatch::getCreatedAt, OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(query.getEndDate() != null, OaMigrationBatch::getCreatedAt, OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaMigrationBatch::getBatchNo, query.getKeyword()).or()
                        .like(OaMigrationBatch::getBatchName, query.getKeyword()).or()
                        .like(OaMigrationBatch::getSourceSnapshot, query.getKeyword()))
                .orderByDesc(OaMigrationBatch::getId));
        return PageResult.of(page);
    }

    public OaMigrationBatch detailBatch(Long id) {
        return requireBatch(id);
    }

    @Transactional
    public Long saveBatch(Long id, BizMigrationBatchSaveRequest request) {
        OaMigrationBatch entity;
        if (id == null) {
            entity = new OaMigrationBatch();
            entity.setBatchNo(StringUtils.hasText(request.getBatchNo())
                    ? request.getBatchNo() : flowSupport.nextBizNo("MIG"));
            entity.setBatchStatus(STATUS_PENDING);
            entity.setTrialRound(request.getTrialRound() == null ? 1 : request.getTrialRound());
            entity.setOrgId(currentOrgId());
            UserContext.Principal principal = UserContext.get();
            entity.setOperatorName(principal == null ? null : principal.displayName());
        } else {
            entity = requireBatch(id);
            if (StringUtils.hasText(request.getBatchNo())) {
                entity.setBatchNo(request.getBatchNo());
            }
            if (request.getTrialRound() != null) {
                entity.setTrialRound(request.getTrialRound());
            }
        }
        entity.setBatchName(request.getBatchName());
        entity.setObjectCode(request.getObjectCode());
        entity.setBatchType(StringUtils.hasText(request.getBatchType()) ? request.getBatchType() : "TRIAL");
        entity.setExtractMethod(StringUtils.hasText(request.getExtractMethod()) ? request.getExtractMethod() : "DB");
        entity.setSourceSnapshot(request.getSourceSnapshot());
        entity.setSnapshotChecksum(request.getSnapshotChecksum());
        entity.setTotalCount(request.getTotalCount() == null ? 0L : request.getTotalCount());
        entity.setSuccessCount(request.getSuccessCount() == null ? 0L : request.getSuccessCount());
        entity.setFailCount(request.getFailCount() == null ? 0L : request.getFailCount());
        entity.setSkipCount(request.getSkipCount() == null ? 0L : request.getSkipCount());
        entity.setStartTime(parseTimestamp(request.getStartTime()));
        entity.setEndTime(parseTimestamp(request.getEndTime()));
        if (StringUtils.hasText(request.getBatchStatus())) {
            entity.setBatchStatus(request.getBatchStatus());
        }
        entity.setRemark(request.getRemark());
        if (id == null) {
            batchMapper.insert(entity);
        } else {
            batchMapper.updateById(entity);
        }
        return entity.getId();
    }

    /**
     * 执行批次：按成功/失败/跳过数量推导批次状态并回写结束时间。
     * 增量批次重复执行不产生重复数据由幂等键与对象唯一约束保证（配置 oa.migration.increment.window.minutes 控制窗口）。
     */
    @Transactional
    public OaMigrationBatch executeBatch(Long id) {
        OaMigrationBatch entity = requireBatch(id);
        long success = entity.getSuccessCount() == null ? 0L : entity.getSuccessCount();
        long fail = entity.getFailCount() == null ? 0L : entity.getFailCount();
        entity.setBatchStatus(fail == 0 ? STATUS_SUCCESS : (success == 0 ? STATUS_FAILED : STATUS_PARTIAL));
        entity.setStartTime(entity.getStartTime() == null ? LocalDateTime.now() : entity.getStartTime());
        entity.setEndTime(LocalDateTime.now());
        batchMapper.updateById(entity);
        return entity;
    }

    @Transactional
    public void deleteBatch(Long id) {
        requireBatch(id);
        batchMapper.deleteById(id);
    }

    // ================= 清洗规则 =================

    public PageResult<OaMigrationCleanRule> pageCleanRules(OaMigrationQuery query) {
        Page<OaMigrationCleanRule> page = query.toPage();
        cleanRuleMapper.selectPage(page, Wrappers.<OaMigrationCleanRule>lambdaQuery()
                .eq(StringUtils.hasText(query.getRuleType()), OaMigrationCleanRule::getRuleType, query.getRuleType())
                .eq(StringUtils.hasText(query.getObjectCode()), OaMigrationCleanRule::getObjectCode, query.getObjectCode())
                .eq(query.getStatus() != null, OaMigrationCleanRule::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaMigrationCleanRule::getRuleNo, query.getKeyword()).or()
                        .like(OaMigrationCleanRule::getRuleName, query.getKeyword()))
                .orderByAsc(OaMigrationCleanRule::getPriority));
        return PageResult.of(page);
    }

    public OaMigrationCleanRule detailCleanRule(Long id) {
        return requireCleanRule(id);
    }

    @Transactional
    public Long saveCleanRule(Long id, BizMigrationCleanRuleSaveRequest request) {
        OaMigrationCleanRule entity;
        if (id == null) {
            entity = new OaMigrationCleanRule();
            entity.setRuleNo(StringUtils.hasText(request.getRuleNo())
                    ? request.getRuleNo() : flowSupport.nextBizNo("MCR"));
            entity.setHitCount(0L);
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireCleanRule(id);
            if (StringUtils.hasText(request.getRuleNo())) {
                entity.setRuleNo(request.getRuleNo());
            }
        }
        entity.setRuleName(request.getRuleName());
        entity.setObjectCode(request.getObjectCode());
        entity.setRuleType(StringUtils.hasText(request.getRuleType()) ? request.getRuleType() : "DEDUP_USER");
        entity.setRuleExpr(request.getRuleExpr());
        entity.setAction(request.getAction());
        entity.setPriority(request.getPriority() == null ? 5 : request.getPriority());
        entity.setStatus(request.getStatus() == null ? 1 : request.getStatus());
        entity.setRemark(request.getRemark());
        if (id == null) {
            cleanRuleMapper.insert(entity);
        } else {
            cleanRuleMapper.updateById(entity);
        }
        return entity.getId();
    }

    @Transactional
    public void deleteCleanRule(Long id) {
        requireCleanRule(id);
        cleanRuleMapper.deleteById(id);
    }

    // ================= 清洗日志 =================

    public PageResult<OaMigrationCleanLog> pageCleanLogs(OaMigrationQuery query) {
        Page<OaMigrationCleanLog> page = query.toPage();
        cleanLogMapper.selectPage(page, Wrappers.<OaMigrationCleanLog>lambdaQuery()
                .eq(query.getBatchId() != null, OaMigrationCleanLog::getBatchId, query.getBatchId())
                .eq(StringUtils.hasText(query.getObjectCode()), OaMigrationCleanLog::getObjectCode, query.getObjectCode())
                .eq(StringUtils.hasText(query.getCleanResult()), OaMigrationCleanLog::getCleanResult, query.getCleanResult())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaMigrationCleanLog::getRecordKey, query.getKeyword()).or()
                        .like(OaMigrationCleanLog::getRuleNo, query.getKeyword()))
                .orderByDesc(OaMigrationCleanLog::getId));
        return PageResult.of(page);
    }

    public OaMigrationCleanLog detailCleanLog(Long id) {
        return requireCleanLog(id);
    }

    /** 登记清洗日志：保留原值与清洗值；命中规则计数累加。 */
    @Transactional
    public Long recordCleanLog(BizMigrationCleanLogSaveRequest request) {
        OaMigrationCleanLog entity = new OaMigrationCleanLog();
        entity.setBatchId(request.getBatchId());
        entity.setRuleId(request.getRuleId());
        entity.setRuleNo(request.getRuleNo());
        entity.setObjectCode(request.getObjectCode());
        entity.setRecordKey(request.getRecordKey());
        entity.setSourceValue(request.getSourceValue());
        entity.setCleanedValue(request.getCleanedValue());
        entity.setCleanResult(StringUtils.hasText(request.getCleanResult()) ? request.getCleanResult() : "CLEANED");
        entity.setMessage(request.getMessage());
        entity.setCleanTime(parseTimestamp(request.getCleanTime()));
        entity.setOrgId(currentOrgId());
        entity.setRemark(request.getRemark());
        cleanLogMapper.insert(entity);
        if (request.getRuleId() != null) {
            OaMigrationCleanRule rule = cleanRuleMapper.selectById(request.getRuleId());
            if (rule != null) {
                rule.setHitCount((rule.getHitCount() == null ? 0L : rule.getHitCount()) + 1);
                cleanRuleMapper.updateById(rule);
            }
        }
        return entity.getId();
    }

    @Transactional
    public void deleteCleanLog(Long id) {
        requireCleanLog(id);
        cleanLogMapper.deleteById(id);
    }

    /** 迁移批次与清洗统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("batchTotal", batchMapper.selectCount(null));
        result.put("batchRunning", batchMapper.selectCount(Wrappers.<OaMigrationBatch>lambdaQuery()
                .eq(OaMigrationBatch::getBatchStatus, STATUS_RUNNING)));
        result.put("batchSuccess", batchMapper.selectCount(Wrappers.<OaMigrationBatch>lambdaQuery()
                .eq(OaMigrationBatch::getBatchStatus, STATUS_SUCCESS)));
        result.put("batchFail", batchMapper.selectCount(Wrappers.<OaMigrationBatch>lambdaQuery()
                .eq(OaMigrationBatch::getBatchStatus, STATUS_FAILED)));
        result.put("cleanRuleTotal", cleanRuleMapper.selectCount(null));
        result.put("cleanLogTotal", cleanLogMapper.selectCount(null));
        result.put("defaultBatchSize", flowSupport.configInt("oa.migration.batch.default.size", 1000));
        result.put("incrementWindowMinutes", flowSupport.configInt("oa.migration.increment.window.minutes", 30));
        result.put("snapshotEnabled", flowSupport.configBoolean("oa.migration.extract.snapshot.enabled", true));
        return result;
    }

    public OaMigrationBatch requireBatch(Long id) {
        OaMigrationBatch entity = batchMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "迁移批次不存在: " + id);
        }
        return entity;
    }

    public OaMigrationCleanRule requireCleanRule(Long id) {
        OaMigrationCleanRule entity = cleanRuleMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "清洗规则不存在: " + id);
        }
        return entity;
    }

    public OaMigrationCleanLog requireCleanLog(Long id) {
        OaMigrationCleanLog entity = cleanLogMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "清洗日志不存在: " + id);
        }
        return entity;
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
