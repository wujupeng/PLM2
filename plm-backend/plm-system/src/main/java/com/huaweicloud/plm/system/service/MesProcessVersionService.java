package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesProcessVersionQuery;
import com.huaweicloud.plm.system.dto.MesProcessVersionSaveRequest;
import com.huaweicloud.plm.system.entity.MesProcessVersion;
import com.huaweicloud.plm.system.mapper.MesProcessVersionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * MES 工艺版本服务。
 */
@Service
@RequiredArgsConstructor
public class MesProcessVersionService {

    private static final String DEFAULT_NO_PREFIX = "MPV";
    private static final String DEFAULT_VERSION_STATUS = "DRAFT";

    private final MesProcessVersionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesProcessVersion> page(MesProcessVersionQuery query) {
        String keyword = query.getKeyword();
        Page<MesProcessVersion> page = mapper.selectPage(query.toPage(), Wrappers.<MesProcessVersion>lambdaQuery()
                .eq(StringUtils.hasText(query.getVersionStatus()), MesProcessVersion::getVersionStatus, query.getVersionStatus())
                .eq(StringUtils.hasText(query.getProcessCode()), MesProcessVersion::getProcessCode, query.getProcessCode())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesProcessVersion::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getRouteCode()), MesProcessVersion::getRouteCode, query.getRouteCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesProcessVersion::getProcessVersionNo, keyword).or()
                        .like(MesProcessVersion::getProcessCode, keyword).or()
                        .like(MesProcessVersion::getMaterialCode, keyword).or()
                        .like(MesProcessVersion::getMaterialName, keyword))
                .orderByDesc(MesProcessVersion::getId));
        return PageResult.of(page);
    }

    public MesProcessVersion detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesProcessVersionSaveRequest request) {
        MesProcessVersion entity;
        if (id == null) {
            entity = new MesProcessVersion();
            entity.setProcessVersionNo(StringUtils.hasText(request.getProcessVersionNo())
                    ? request.getProcessVersionNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setVersionStatus(StringUtils.hasText(request.getVersionStatus())
                    ? request.getVersionStatus() : DEFAULT_VERSION_STATUS);
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

    private MesProcessVersion require(Long id) {
        MesProcessVersion entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "工艺版本不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesProcessVersion entity, MesProcessVersionSaveRequest request) {
        if (StringUtils.hasText(request.getProcessVersionNo())) {
            entity.setProcessVersionNo(request.getProcessVersionNo());
        }
        if (StringUtils.hasText(request.getProcessCode())) {
            entity.setProcessCode(request.getProcessCode());
        }
        if (StringUtils.hasText(request.getProcessName())) {
            entity.setProcessName(request.getProcessName());
        }
        if (StringUtils.hasText(request.getVersionNo())) {
            entity.setVersionNo(request.getVersionNo());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getSpec())) {
            entity.setSpec(request.getSpec());
        }
        if (StringUtils.hasText(request.getRouteCode())) {
            entity.setRouteCode(request.getRouteCode());
        }
        if (StringUtils.hasText(request.getRouteName())) {
            entity.setRouteName(request.getRouteName());
        }
        if (request.getEffectiveDate() != null) {
            entity.setEffectiveDate(request.getEffectiveDate());
        }
        if (request.getExpireDate() != null) {
            entity.setExpireDate(request.getExpireDate());
        }
        if (StringUtils.hasText(request.getVersionStatus())) {
            entity.setVersionStatus(request.getVersionStatus());
        }
        if (StringUtils.hasText(request.getApprover())) {
            entity.setApprover(request.getApprover());
        }
        if (request.getApproveTime() != null) {
            entity.setApproveTime(request.getApproveTime());
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
