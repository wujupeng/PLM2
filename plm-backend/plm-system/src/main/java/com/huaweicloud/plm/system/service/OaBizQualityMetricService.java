package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizQualityMetricSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizQualityMetric;
import com.huaweicloud.plm.system.mapper.OaBizQualityMetricMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

/**
 * 质量报表与指标（OA-DEV-069）：RTY、质量月报等，公式/来源/口径可追溯。
 * 质量台账权威在 QMS，OA 仅承载报表口径配置与展示；数据来源与 RTY 目标为可配置项。
 */
@Service
@RequiredArgsConstructor
public class OaBizQualityMetricService {

    private static final String STATUS_DRAFT = "DRAFT";

    private static final String STATUS_PUBLISHED = "PUBLISHED";

    private final OaBizQualityMetricMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaBizQualityMetric> page(OaBizFlowQuery query) {
        Page<OaBizQualityMetric> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaBizQualityMetric>lambdaQuery()
                .eq(StringUtils.hasText(query.getFlowStatus()), OaBizQualityMetric::getMetricStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaBizQualityMetric::getOrgId, query.getOrgId())
                .eq(StringUtils.hasText(query.getTypeCode()), OaBizQualityMetric::getMetricType, query.getTypeCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaBizQualityMetric::getMetricNo, query.getKeyword()).or()
                        .like(OaBizQualityMetric::getMetricName, query.getKeyword()).or()
                        .like(OaBizQualityMetric::getMetricCode, query.getKeyword()))
                .orderByDesc(OaBizQualityMetric::getId));
        return PageResult.of(page);
    }

    public OaBizQualityMetric detail(Long id) {
        return requireEntity(id);
    }

    @Transactional
    public Long save(Long id, BizQualityMetricSaveRequest request) {
        OaBizQualityMetric entity;
        if (id == null) {
            entity = new OaBizQualityMetric();
            entity.setMetricNo(flowSupport.nextBizNo("QM"));
            entity.setOwnerUserId(UserContext.getUserId());
            entity.setOwnerName(currentDisplayName());
            entity.setOrgId(currentOrgId());
            entity.setMetricStatus(STATUS_DRAFT);
        } else {
            entity = requireEntity(id);
            if (STATUS_PUBLISHED.equals(entity.getMetricStatus())) {
                throw new BusinessException(ResultCode.CONFLICT, "已发布的质量指标不可修改");
            }
        }
        validate(request);
        entity.setMetricType(StringUtils.hasText(request.getMetricType()) ? request.getMetricType() : "TARGET");
        entity.setMetricCode(request.getMetricCode());
        entity.setMetricName(request.getMetricName());
        entity.setMetricPeriod(request.getMetricPeriod());
        entity.setDeptId(request.getDeptId());
        entity.setDeptName(request.getDeptName());
        entity.setTargetValue(request.getTargetValue());
        entity.setActualValue(request.getActualValue());
        entity.setUnit(request.getUnit());
        entity.setCalcFormula(request.getCalcFormula());
        entity.setDataSource(StringUtils.hasText(request.getDataSource()) ? request.getDataSource()
                : flowSupport.configString("oa.biz.quality.data.source", "QMS"));
        entity.setSourceRef(request.getSourceRef());
        entity.setOwnerUserId(request.getOwnerUserId() == null ? entity.getOwnerUserId() : request.getOwnerUserId());
        entity.setOwnerName(StringUtils.hasText(request.getOwnerName()) ? request.getOwnerName() : entity.getOwnerName());
        entity.setRemark(request.getRemark());
        entity.setAchieveRate(calcAchieveRate(request.getActualValue(), request.getTargetValue()));
        entity.setRefreshTime(LocalDateTime.now());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 发布指标：草稿可发布。 */
    @Transactional
    public void publish(Long id) {
        OaBizQualityMetric entity = requireEntity(id);
        if (STATUS_PUBLISHED.equals(entity.getMetricStatus())) {
            return;
        }
        entity.setMetricStatus(STATUS_PUBLISHED);
        mapper.updateById(entity);
    }

    @Transactional
    public void delete(Long id) {
        OaBizQualityMetric entity = requireEntity(id);
        if (STATUS_PUBLISHED.equals(entity.getMetricStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "已发布的质量指标不可删除");
        }
        mapper.deleteById(id);
    }

    public OaBizQualityMetric requireEntity(Long id) {
        OaBizQualityMetric entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "质量指标不存在: " + id);
        }
        return entity;
    }

    private void validate(BizQualityMetricSaveRequest request) {
        if (!StringUtils.hasText(request.getMetricName())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "指标名称不能为空");
        }
    }

    private BigDecimal calcAchieveRate(BigDecimal actual, BigDecimal target) {
        if (actual == null || target == null || target.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        return actual.multiply(BigDecimal.valueOf(100)).divide(target, 2, RoundingMode.HALF_UP);
    }

    private String currentDisplayName() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.displayName();
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
