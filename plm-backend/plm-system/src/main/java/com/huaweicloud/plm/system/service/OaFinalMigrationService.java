package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OaFinalMigrationSaveRequest;
import com.huaweicloud.plm.system.dto.OaGoliveQuery;
import com.huaweicloud.plm.system.entity.OaFinalMigration;
import com.huaweicloud.plm.system.mapper.OaFinalMigrationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 执行最终全量及增量迁移（OA-DEV-115）：迁移批次、抽取范围、导入结果与校验状态维护。
 * 迁移状态由导入结果推导，校验容差取自可配置项。
 */
@Service
@RequiredArgsConstructor
public class OaFinalMigrationService {

    private static final String TYPE_FULL = "FULL";
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_SUCCESS = "SUCCESS";
    private static final String STATUS_PARTIAL = "PARTIAL";
    private static final String STATUS_FAILED = "FAILED";
    private static final String VERIFY_PENDING = "PENDING";
    private static final String VERIFY_VERIFIED = "VERIFIED";
    private static final String VERIFY_EXCEPTION = "EXCEPTION";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaFinalMigrationMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaFinalMigration> pageMigrations(OaGoliveQuery query) {
        Page<OaFinalMigration> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaFinalMigration>lambdaQuery()
                .eq(StringUtils.hasText(query.getMigType()), OaFinalMigration::getMigType, query.getMigType())
                .eq(StringUtils.hasText(query.getMigStatus()), OaFinalMigration::getMigStatus, query.getMigStatus())
                .eq(StringUtils.hasText(query.getVerifyStatus()), OaFinalMigration::getVerifyStatus, query.getVerifyStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaFinalMigration::getMigNo, query.getKeyword()).or()
                        .like(OaFinalMigration::getMigName, query.getKeyword()).or()
                        .like(OaFinalMigration::getSourceScope, query.getKeyword()))
                .orderByDesc(OaFinalMigration::getId));
        return PageResult.of(page);
    }

    public OaFinalMigration detail(Long id) {
        return requireMigration(id);
    }

    @Transactional
    public Long save(Long id, OaFinalMigrationSaveRequest request) {
        OaFinalMigration entity;
        if (id == null) {
            entity = new OaFinalMigration();
            entity.setMigNo(StringUtils.hasText(request.getMigNo())
                    ? request.getMigNo() : flowSupport.nextBizNo("FM"));
            entity.setMigType(StringUtils.hasText(request.getMigType()) ? request.getMigType() : TYPE_FULL);
            entity.setVerifyStatus(StringUtils.hasText(request.getVerifyStatus())
                    ? request.getVerifyStatus() : VERIFY_PENDING);
            entity.setVerifyPass(request.getVerifyPass() != null ? request.getVerifyPass() : 0);
            entity.setMigStatus(StringUtils.hasText(request.getMigStatus())
                    ? request.getMigStatus() : STATUS_PENDING);
            entity.setImportedCount(request.getImportedCount() != null ? request.getImportedCount() : 0L);
            entity.setFailedCount(request.getFailedCount() != null ? request.getFailedCount() : 0L);
            entity.setAttachmentCount(request.getAttachmentCount() != null ? request.getAttachmentCount() : 0L);
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireMigration(id);
            if (StringUtils.hasText(request.getMigNo())) {
                entity.setMigNo(request.getMigNo());
            }
            if (StringUtils.hasText(request.getMigType())) {
                entity.setMigType(request.getMigType());
            }
            if (StringUtils.hasText(request.getVerifyStatus())) {
                entity.setVerifyStatus(request.getVerifyStatus());
            }
            if (request.getVerifyPass() != null) {
                entity.setVerifyPass(request.getVerifyPass());
            }
            if (StringUtils.hasText(request.getMigStatus())) {
                entity.setMigStatus(request.getMigStatus());
            }
            if (request.getImportedCount() != null) {
                entity.setImportedCount(request.getImportedCount());
            }
            if (request.getFailedCount() != null) {
                entity.setFailedCount(request.getFailedCount());
            }
            if (request.getAttachmentCount() != null) {
                entity.setAttachmentCount(request.getAttachmentCount());
            }
        }
        entity.setMigName(request.getMigName());
        entity.setSourceScope(request.getSourceScope());
        entity.setExtractStart(parseTimestamp(request.getExtractStart()));
        entity.setExtractEnd(parseTimestamp(request.getExtractEnd()));
        entity.setOperatorName(request.getOperatorName());
        entity.setMigTime(parseTimestamp(request.getMigTime()));
        entity.setOrgName(request.getOrgName());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 执行迁移：按导入结果推导迁移状态并回写迁移时间。 */
    @Transactional
    public OaFinalMigration execute(Long id) {
        OaFinalMigration entity = requireMigration(id);
        long imported = entity.getImportedCount() == null ? 0L : entity.getImportedCount();
        long failed = entity.getFailedCount() == null ? 0L : entity.getFailedCount();
        if (imported > 0 && failed == 0) {
            entity.setMigStatus(STATUS_SUCCESS);
        } else if (imported > 0 && failed > 0) {
            entity.setMigStatus(STATUS_PARTIAL);
        } else {
            entity.setMigStatus(STATUS_FAILED);
        }
        entity.setMigTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 校验迁移结果：校验结果为空时由是否通过推导。 */
    @Transactional
    public OaFinalMigration verify(Long id, Boolean verifyPass, String verifyStatus) {
        OaFinalMigration entity = requireMigration(id);
        if (verifyPass != null) {
            entity.setVerifyPass(Boolean.TRUE.equals(verifyPass) ? 1 : 0);
        }
        if (StringUtils.hasText(verifyStatus)) {
            entity.setVerifyStatus(verifyStatus);
        } else {
            entity.setVerifyStatus(Integer.valueOf(1).equals(entity.getVerifyPass())
                    ? VERIFY_VERIFIED : VERIFY_EXCEPTION);
        }
        mapper.updateById(entity);
        return entity;
    }

    @Transactional
    public void delete(Long id) {
        requireMigration(id);
        mapper.deleteById(id);
    }

    /** 执行最终全量及增量迁移统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("success", mapper.selectCount(Wrappers.<OaFinalMigration>lambdaQuery()
                .eq(OaFinalMigration::getMigStatus, STATUS_SUCCESS)));
        result.put("partial", mapper.selectCount(Wrappers.<OaFinalMigration>lambdaQuery()
                .eq(OaFinalMigration::getMigStatus, STATUS_PARTIAL)));
        result.put("failed", mapper.selectCount(Wrappers.<OaFinalMigration>lambdaQuery()
                .eq(OaFinalMigration::getMigStatus, STATUS_FAILED)));
        result.put("pending", mapper.selectCount(Wrappers.<OaFinalMigration>lambdaQuery()
                .eq(OaFinalMigration::getMigStatus, STATUS_PENDING)));
        result.put("fullCount", mapper.selectCount(Wrappers.<OaFinalMigration>lambdaQuery()
                .eq(OaFinalMigration::getMigType, TYPE_FULL)));
        result.put("incrementCount", mapper.selectCount(Wrappers.<OaFinalMigration>lambdaQuery()
                .eq(OaFinalMigration::getMigType, "INCREMENT")));
        List<OaFinalMigration> all = mapper.selectList(null);
        long importedTotal = 0L;
        long failedTotal = 0L;
        for (OaFinalMigration item : all) {
            importedTotal += item.getImportedCount() == null ? 0L : item.getImportedCount();
            failedTotal += item.getFailedCount() == null ? 0L : item.getFailedCount();
        }
        result.put("importedTotal", importedTotal);
        result.put("failedTotal", failedTotal);
        result.put("verifyTolerance", flowSupport.configInt("oa.golive.verify.tolerance", 0));
        return result;
    }

    public OaFinalMigration requireMigration(Long id) {
        OaFinalMigration entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "迁移记录不存在: " + id);
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
