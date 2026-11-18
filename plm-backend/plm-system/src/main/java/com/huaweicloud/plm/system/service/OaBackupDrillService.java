package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OaBackupDrillSaveRequest;
import com.huaweicloud.plm.system.dto.OaTestQuery;
import com.huaweicloud.plm.system.entity.OaBackupDrill;
import com.huaweicloud.plm.system.mapper.OaBackupDrillMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 备份恢复演练（OA-DEV-110）：演练类型、备份来源、RPO/RTO 目标与实际指标维护与恢复结论推导。
 * RPO/RTO 目标为可配置项，便于按验收口径调整。
 */
@Service
@RequiredArgsConstructor
public class OaBackupDrillService {

    private static final String RESULT_SUCCESS = "SUCCESS";
    private static final String RESULT_PARTIAL = "PARTIAL";
    private static final String RESULT_FAILED = "FAILED";
    private static final String RESULT_PENDING = "PENDING";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaBackupDrillMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaBackupDrill> pageBackupDrills(OaTestQuery query) {
        Page<OaBackupDrill> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaBackupDrill>lambdaQuery()
                .eq(StringUtils.hasText(query.getDrillType()), OaBackupDrill::getDrillType, query.getDrillType())
                .eq(StringUtils.hasText(query.getRestoreResult()), OaBackupDrill::getRestoreResult, query.getRestoreResult())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaBackupDrill::getDrillNo, query.getKeyword()).or()
                        .like(OaBackupDrill::getDrillName, query.getKeyword()))
                .orderByDesc(OaBackupDrill::getId));
        return PageResult.of(page);
    }

    public OaBackupDrill detail(Long id) {
        return requireBackupDrill(id);
    }

    @Transactional
    public Long save(Long id, OaBackupDrillSaveRequest request) {
        OaBackupDrill entity;
        if (id == null) {
            entity = new OaBackupDrill();
            entity.setDrillNo(StringUtils.hasText(request.getDrillNo())
                    ? request.getDrillNo() : flowSupport.nextBizNo("BD"));
            entity.setDrillType(StringUtils.hasText(request.getDrillType()) ? request.getDrillType() : "DB");
            entity.setRestoreResult(StringUtils.hasText(request.getRestoreResult())
                    ? request.getRestoreResult() : RESULT_PENDING);
            entity.setTargetRpoMinutes(request.getTargetRpoMinutes() == null
                    ? flowSupport.configInt("oa.backup.rpo.minutes", 15) : request.getTargetRpoMinutes());
            entity.setTargetRtoMinutes(request.getTargetRtoMinutes() == null
                    ? flowSupport.configInt("oa.backup.rto.minutes", 120) : request.getTargetRtoMinutes());
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireBackupDrill(id);
            if (StringUtils.hasText(request.getDrillNo())) {
                entity.setDrillNo(request.getDrillNo());
            }
        }
        entity.setDrillName(request.getDrillName());
        if (StringUtils.hasText(request.getDrillType())) {
            entity.setDrillType(request.getDrillType());
        }
        entity.setBackupSource(request.getBackupSource());
        entity.setBackupTime(parseTimestamp(request.getBackupTime()));
        if (request.getTargetRpoMinutes() != null) {
            entity.setTargetRpoMinutes(request.getTargetRpoMinutes());
        }
        if (request.getTargetRtoMinutes() != null) {
            entity.setTargetRtoMinutes(request.getTargetRtoMinutes());
        }
        entity.setRestoreStart(parseTimestamp(request.getRestoreStart()));
        entity.setRestoreEnd(parseTimestamp(request.getRestoreEnd()));
        entity.setActualRpoMinutes(request.getActualRpoMinutes() == null ? 0 : request.getActualRpoMinutes());
        entity.setActualRtoMinutes(request.getActualRtoMinutes() == null ? 0 : request.getActualRtoMinutes());
        if (StringUtils.hasText(request.getRestoreResult())) {
            entity.setRestoreResult(request.getRestoreResult());
        }
        entity.setDataVerified(request.getDataVerified() == null ? 0 : request.getDataVerified());
        entity.setOperatorName(request.getOperatorName());
        entity.setDrillTime(parseTimestamp(request.getDrillTime()));
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    @Transactional
    public void delete(Long id) {
        requireBackupDrill(id);
        mapper.deleteById(id);
    }

    /** 依据数据校验与实际 RPO/RTO 推导恢复结论，并记录演练时间。 */
    @Transactional
    public OaBackupDrill restore(Long id) {
        OaBackupDrill entity = requireBackupDrill(id);
        boolean verified = entity.getDataVerified() != null && entity.getDataVerified() == 1;
        boolean rtoReached = entity.getActualRtoMinutes() != null && entity.getTargetRtoMinutes() != null
                && entity.getActualRtoMinutes() <= entity.getTargetRtoMinutes();
        boolean rpoReached = entity.getActualRpoMinutes() != null && entity.getTargetRpoMinutes() != null
                && entity.getActualRpoMinutes() <= entity.getTargetRpoMinutes();
        entity.setRestoreResult(verified && rtoReached && rpoReached ? RESULT_SUCCESS : RESULT_FAILED);
        entity.setDrillTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 备份恢复演练统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("success", mapper.selectCount(Wrappers.<OaBackupDrill>lambdaQuery()
                .eq(OaBackupDrill::getRestoreResult, RESULT_SUCCESS)));
        result.put("partial", mapper.selectCount(Wrappers.<OaBackupDrill>lambdaQuery()
                .eq(OaBackupDrill::getRestoreResult, RESULT_PARTIAL)));
        result.put("failed", mapper.selectCount(Wrappers.<OaBackupDrill>lambdaQuery()
                .eq(OaBackupDrill::getRestoreResult, RESULT_FAILED)));
        result.put("pending", mapper.selectCount(Wrappers.<OaBackupDrill>lambdaQuery()
                .eq(OaBackupDrill::getRestoreResult, RESULT_PENDING)));
        result.put("targetRpo", flowSupport.configInt("oa.backup.rpo.minutes", 15));
        result.put("targetRto", flowSupport.configInt("oa.backup.rto.minutes", 120));
        return result;
    }

    public OaBackupDrill requireBackupDrill(Long id) {
        OaBackupDrill entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "备份恢复演练不存在: " + id);
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
