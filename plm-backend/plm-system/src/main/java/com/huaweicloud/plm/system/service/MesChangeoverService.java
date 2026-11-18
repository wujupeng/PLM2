package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesChangeoverQuery;
import com.huaweicloud.plm.system.dto.MesChangeoverSaveRequest;
import com.huaweicloud.plm.system.entity.MesChangeover;
import com.huaweicloud.plm.system.mapper.MesChangeoverMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 换线换型单服务。
 */
@Service
@RequiredArgsConstructor
public class MesChangeoverService {

    private static final String DEFAULT_NO_PREFIX = "MCO";
    private static final String DEFAULT_CHANGEOVER_TYPE = "MODEL";
    private static final String DEFAULT_CHANGEOVER_STATUS = "DRAFT";

    private final MesChangeoverMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesChangeover> page(MesChangeoverQuery query) {
        String keyword = query.getKeyword();
        Page<MesChangeover> page = mapper.selectPage(query.toPage(), Wrappers.<MesChangeover>lambdaQuery()
                .eq(StringUtils.hasText(query.getChangeoverStatus()), MesChangeover::getChangeoverStatus, query.getChangeoverStatus())
                .eq(StringUtils.hasText(query.getChangeoverType()), MesChangeover::getChangeoverType, query.getChangeoverType())
                .eq(StringUtils.hasText(query.getLineCode()), MesChangeover::getLineCode, query.getLineCode())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesChangeover::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesChangeover::getChangeoverNo, keyword).or()
                        .like(MesChangeover::getWorkOrderNo, keyword).or()
                        .like(MesChangeover::getLineCode, keyword).or()
                        .like(MesChangeover::getMaterialCode, keyword))
                .orderByDesc(MesChangeover::getId));
        return PageResult.of(page);
    }

    public MesChangeover detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesChangeoverSaveRequest request) {
        MesChangeover entity;
        if (id == null) {
            entity = new MesChangeover();
            entity.setChangeoverNo(StringUtils.hasText(request.getChangeoverNo())
                    ? request.getChangeoverNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setChangeoverType(StringUtils.hasText(request.getChangeoverType())
                    ? request.getChangeoverType() : DEFAULT_CHANGEOVER_TYPE);
            entity.setChangeoverStatus(StringUtils.hasText(request.getChangeoverStatus())
                    ? request.getChangeoverStatus() : DEFAULT_CHANGEOVER_STATUS);
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

    private MesChangeover require(Long id) {
        MesChangeover entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "换线换型不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesChangeover entity, MesChangeoverSaveRequest request) {
        if (StringUtils.hasText(request.getChangeoverNo())) {
            entity.setChangeoverNo(request.getChangeoverNo());
        }
        if (StringUtils.hasText(request.getWorkOrderNo())) {
            entity.setWorkOrderNo(request.getWorkOrderNo());
        }
        if (StringUtils.hasText(request.getLineCode())) {
            entity.setLineCode(request.getLineCode());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getChangeoverType())) {
            entity.setChangeoverType(request.getChangeoverType());
        }
        if (request.getStartTime() != null) {
            entity.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            entity.setEndTime(request.getEndTime());
        }
        if (request.getDurationMinutes() != null) {
            entity.setDurationMinutes(request.getDurationMinutes());
        }
        if (StringUtils.hasText(request.getChangeoverStatus())) {
            entity.setChangeoverStatus(request.getChangeoverStatus());
        }
        if (StringUtils.hasText(request.getOperator())) {
            entity.setOperator(request.getOperator());
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
