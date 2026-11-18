package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesInspectionSpecQuery;
import com.huaweicloud.plm.system.dto.MesInspectionSpecSaveRequest;
import com.huaweicloud.plm.system.entity.MesInspectionSpec;
import com.huaweicloud.plm.system.mapper.MesInspectionSpecMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 检验规范服务。
 */
@Service
@RequiredArgsConstructor
public class MesInspectionSpecService {

    private static final String DEFAULT_NO_PREFIX = "MQS";
    private static final String DEFAULT_SPEC_TYPE = "INCOMING";
    private static final String DEFAULT_SPEC_STATUS = "DRAFT";

    private final MesInspectionSpecMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesInspectionSpec> page(MesInspectionSpecQuery query) {
        String keyword = query.getKeyword();
        Page<MesInspectionSpec> page = mapper.selectPage(query.toPage(), Wrappers.<MesInspectionSpec>lambdaQuery()
                .eq(StringUtils.hasText(query.getSpecType()), MesInspectionSpec::getSpecType, query.getSpecType())
                .eq(StringUtils.hasText(query.getSpecStatus()), MesInspectionSpec::getSpecStatus, query.getSpecStatus())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesInspectionSpec::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getProcessCode()), MesInspectionSpec::getProcessCode, query.getProcessCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesInspectionSpec::getSpecNo, keyword).or()
                        .like(MesInspectionSpec::getSpecName, keyword).or()
                        .like(MesInspectionSpec::getMaterialCode, keyword).or()
                        .like(MesInspectionSpec::getMaterialName, keyword))
                .orderByDesc(MesInspectionSpec::getId));
        return PageResult.of(page);
    }

    public MesInspectionSpec detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesInspectionSpecSaveRequest request) {
        MesInspectionSpec entity;
        if (id == null) {
            entity = new MesInspectionSpec();
            entity.setSpecNo(StringUtils.hasText(request.getSpecNo())
                    ? request.getSpecNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setSpecType(StringUtils.hasText(request.getSpecType())
                    ? request.getSpecType() : DEFAULT_SPEC_TYPE);
            entity.setSpecStatus(StringUtils.hasText(request.getSpecStatus())
                    ? request.getSpecStatus() : DEFAULT_SPEC_STATUS);
            entity.setOrgId(currentOrgId());
            applyRequest(entity, request);
            mapper.insert(entity);
        } else {
            entity = require(id);
            applyRequest(entity, request);
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    private MesInspectionSpec require(Long id) {
        MesInspectionSpec entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "检验规范不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesInspectionSpec entity, MesInspectionSpecSaveRequest request) {
        if (StringUtils.hasText(request.getSpecNo())) {
            entity.setSpecNo(request.getSpecNo());
        }
        if (StringUtils.hasText(request.getSpecName())) {
            entity.setSpecName(request.getSpecName());
        }
        if (StringUtils.hasText(request.getSpecType())) {
            entity.setSpecType(request.getSpecType());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getProcessCode())) {
            entity.setProcessCode(request.getProcessCode());
        }
        if (StringUtils.hasText(request.getInspectionItem())) {
            entity.setInspectionItem(request.getInspectionItem());
        }
        if (StringUtils.hasText(request.getInspectionMethod())) {
            entity.setInspectionMethod(request.getInspectionMethod());
        }
        if (StringUtils.hasText(request.getStandardValue())) {
            entity.setStandardValue(request.getStandardValue());
        }
        if (request.getUpperLimit() != null) {
            entity.setUpperLimit(request.getUpperLimit());
        }
        if (request.getLowerLimit() != null) {
            entity.setLowerLimit(request.getLowerLimit());
        }
        if (StringUtils.hasText(request.getSamplePlan())) {
            entity.setSamplePlan(request.getSamplePlan());
        }
        if (StringUtils.hasText(request.getAql())) {
            entity.setAql(request.getAql());
        }
        if (StringUtils.hasText(request.getSpecVersion())) {
            entity.setSpecVersion(request.getSpecVersion());
        }
        if (StringUtils.hasText(request.getSpecStatus())) {
            entity.setSpecStatus(request.getSpecStatus());
        }
        if (request.getEffectiveDate() != null) {
            entity.setEffectiveDate(request.getEffectiveDate());
        }
        if (request.getExpireDate() != null) {
            entity.setExpireDate(request.getExpireDate());
        }
        if (StringUtils.hasText(request.getOwner())) {
            entity.setOwner(request.getOwner());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
