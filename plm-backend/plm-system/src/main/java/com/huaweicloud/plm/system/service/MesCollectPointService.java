package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesCollectPointQuery;
import com.huaweicloud.plm.system.dto.MesCollectPointSaveRequest;
import com.huaweicloud.plm.system.entity.MesCollectPoint;
import com.huaweicloud.plm.system.mapper.MesCollectPointMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 采集数据点记录服务。
 */
@Service
@RequiredArgsConstructor
public class MesCollectPointService {

    private static final String DEFAULT_NO_PREFIX = "MCP";
    private static final String DEFAULT_DATA_TYPE = "NUMERIC";
    private static final String DEFAULT_POINT_STATUS = "OFFLINE";

    private final MesCollectPointMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesCollectPoint> page(MesCollectPointQuery query) {
        String keyword = query.getKeyword();
        Page<MesCollectPoint> page = mapper.selectPage(query.toPage(), Wrappers.<MesCollectPoint>lambdaQuery()
                .eq(StringUtils.hasText(query.getPointStatus()), MesCollectPoint::getPointStatus, query.getPointStatus())
                .eq(StringUtils.hasText(query.getDataType()), MesCollectPoint::getDataType, query.getDataType())
                .eq(StringUtils.hasText(query.getInterfaceNo()), MesCollectPoint::getInterfaceNo, query.getInterfaceNo())
                .eq(StringUtils.hasText(query.getDeviceCode()), MesCollectPoint::getDeviceCode, query.getDeviceCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesCollectPoint::getPointNo, keyword).or()
                        .like(MesCollectPoint::getPointCode, keyword).or()
                        .like(MesCollectPoint::getPointName, keyword).or()
                        .like(MesCollectPoint::getInterfaceNo, keyword))
                .orderByDesc(MesCollectPoint::getId));
        return PageResult.of(page);
    }

    public MesCollectPoint detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesCollectPointSaveRequest request) {
        MesCollectPoint entity;
        if (id == null) {
            entity = new MesCollectPoint();
            entity.setPointNo(StringUtils.hasText(request.getPointNo())
                    ? request.getPointNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setDataType(StringUtils.hasText(request.getDataType())
                    ? request.getDataType() : DEFAULT_DATA_TYPE);
            entity.setPointStatus(StringUtils.hasText(request.getPointStatus())
                    ? request.getPointStatus() : DEFAULT_POINT_STATUS);
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

    private MesCollectPoint require(Long id) {
        MesCollectPoint entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "采集数据点不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesCollectPoint entity, MesCollectPointSaveRequest request) {
        if (StringUtils.hasText(request.getPointNo())) {
            entity.setPointNo(request.getPointNo());
        }
        if (StringUtils.hasText(request.getPointCode())) {
            entity.setPointCode(request.getPointCode());
        }
        if (StringUtils.hasText(request.getPointName())) {
            entity.setPointName(request.getPointName());
        }
        if (StringUtils.hasText(request.getInterfaceNo())) {
            entity.setInterfaceNo(request.getInterfaceNo());
        }
        if (StringUtils.hasText(request.getDeviceCode())) {
            entity.setDeviceCode(request.getDeviceCode());
        }
        if (StringUtils.hasText(request.getAddress())) {
            entity.setAddress(request.getAddress());
        }
        if (StringUtils.hasText(request.getDataType())) {
            entity.setDataType(request.getDataType());
        }
        if (StringUtils.hasText(request.getUom())) {
            entity.setUom(request.getUom());
        }
        if (request.getScaleFactor() != null) {
            entity.setScaleFactor(request.getScaleFactor());
        }
        if (request.getUpperLimit() != null) {
            entity.setUpperLimit(request.getUpperLimit());
        }
        if (request.getLowerLimit() != null) {
            entity.setLowerLimit(request.getLowerLimit());
        }
        if (StringUtils.hasText(request.getPointStatus())) {
            entity.setPointStatus(request.getPointStatus());
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
