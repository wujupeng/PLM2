package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OaTestQuery;
import com.huaweicloud.plm.system.dto.OaTrainingMaterialSaveRequest;
import com.huaweicloud.plm.system.entity.OaTrainingMaterial;
import com.huaweicloud.plm.system.mapper.OaTrainingMaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 培训交付材料（OA-DEV-112）：培训材料名称、类型、目标角色、发布版本与签到情况维护。
 * 材料类型与签到人数为可配置数据，便于按培训交付进度调整。
 */
@Service
@RequiredArgsConstructor
public class OaTrainingMaterialService {

    private static final String TYPE_MANUAL = "MANUAL";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaTrainingMaterialMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaTrainingMaterial> pageTrainingMaterials(OaTestQuery query) {
        Page<OaTrainingMaterial> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaTrainingMaterial>lambdaQuery()
                .eq(StringUtils.hasText(query.getMaterialType()), OaTrainingMaterial::getMaterialType, query.getMaterialType())
                .eq(StringUtils.hasText(query.getTargetRole()), OaTrainingMaterial::getTargetRole, query.getTargetRole())
                .eq(query.getStatus() != null, OaTrainingMaterial::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaTrainingMaterial::getMaterialNo, query.getKeyword()).or()
                        .like(OaTrainingMaterial::getMaterialName, query.getKeyword()).or()
                        .like(OaTrainingMaterial::getTargetRole, query.getKeyword()))
                .orderByDesc(OaTrainingMaterial::getId));
        return PageResult.of(page);
    }

    public OaTrainingMaterial detail(Long id) {
        return requireMaterial(id);
    }

    @Transactional
    public Long save(Long id, OaTrainingMaterialSaveRequest request) {
        OaTrainingMaterial entity;
        if (id == null) {
            entity = new OaTrainingMaterial();
            entity.setMaterialNo(StringUtils.hasText(request.getMaterialNo())
                    ? request.getMaterialNo() : flowSupport.nextBizNo("TM"));
            entity.setMaterialType(StringUtils.hasText(request.getMaterialType())
                    ? request.getMaterialType() : TYPE_MANUAL);
            entity.setStatus(request.getStatus() == null ? 1 : request.getStatus());
            entity.setAudienceCount(request.getAudienceCount() == null ? 0 : request.getAudienceCount());
            entity.setSignedCount(request.getSignedCount() == null ? 0 : request.getSignedCount());
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireMaterial(id);
            if (StringUtils.hasText(request.getMaterialNo())) {
                entity.setMaterialNo(request.getMaterialNo());
            }
            if (StringUtils.hasText(request.getMaterialType())) {
                entity.setMaterialType(request.getMaterialType());
            }
            if (request.getStatus() != null) {
                entity.setStatus(request.getStatus());
            }
            if (request.getAudienceCount() != null) {
                entity.setAudienceCount(request.getAudienceCount());
            }
            if (request.getSignedCount() != null) {
                entity.setSignedCount(request.getSignedCount());
            }
        }
        entity.setMaterialName(request.getMaterialName());
        entity.setTargetRole(request.getTargetRole());
        entity.setFormat(request.getFormat());
        entity.setLocation(request.getLocation());
        entity.setMaterialVersion(request.getMaterialVersion());
        entity.setPublishTime(parseTimestamp(request.getPublishTime()));
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
        requireMaterial(id);
        mapper.deleteById(id);
    }

    /** 登记一次签到，签到人数不超过应到人数。 */
    @Transactional
    public OaTrainingMaterial sign(Long id) {
        OaTrainingMaterial entity = requireMaterial(id);
        int signed = (entity.getSignedCount() == null ? 0 : entity.getSignedCount()) + 1;
        if (entity.getAudienceCount() != null && entity.getAudienceCount() > 0 && signed > entity.getAudienceCount()) {
            signed = entity.getAudienceCount();
        }
        entity.setSignedCount(signed);
        mapper.updateById(entity);
        return entity;
    }

    /** 培训交付材料统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("roleTraining", mapper.selectCount(Wrappers.<OaTrainingMaterial>lambdaQuery()
                .eq(OaTrainingMaterial::getMaterialType, "ROLE_TRAINING")));
        result.put("manual", mapper.selectCount(Wrappers.<OaTrainingMaterial>lambdaQuery()
                .eq(OaTrainingMaterial::getMaterialType, TYPE_MANUAL)));
        result.put("video", mapper.selectCount(Wrappers.<OaTrainingMaterial>lambdaQuery()
                .eq(OaTrainingMaterial::getMaterialType, "VIDEO")));
        result.put("faq", mapper.selectCount(Wrappers.<OaTrainingMaterial>lambdaQuery()
                .eq(OaTrainingMaterial::getMaterialType, "FAQ")));
        long audienceTotal = 0L;
        long signedTotal = 0L;
        for (OaTrainingMaterial material : mapper.selectList(null)) {
            audienceTotal += material.getAudienceCount() == null ? 0 : material.getAudienceCount();
            signedTotal += material.getSignedCount() == null ? 0 : material.getSignedCount();
        }
        result.put("audienceTotal", audienceTotal);
        result.put("signedTotal", signedTotal);
        return result;
    }

    public OaTrainingMaterial requireMaterial(Long id) {
        OaTrainingMaterial entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "培训材料不存在: " + id);
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
