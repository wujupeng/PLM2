package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesCollectDeviceQuery;
import com.huaweicloud.plm.system.dto.MesCollectDeviceSaveRequest;
import com.huaweicloud.plm.system.entity.MesCollectDevice;
import com.huaweicloud.plm.system.mapper.MesCollectDeviceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 采集设备记录服务。
 */
@Service
@RequiredArgsConstructor
public class MesCollectDeviceService {

    private static final String DEFAULT_NO_PREFIX = "MCD";
    private static final String DEFAULT_DEVICE_TYPE = "TEST";
    private static final String DEFAULT_DEVICE_STATUS = "OFFLINE";

    private final MesCollectDeviceMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesCollectDevice> page(MesCollectDeviceQuery query) {
        String keyword = query.getKeyword();
        Page<MesCollectDevice> page = mapper.selectPage(query.toPage(), Wrappers.<MesCollectDevice>lambdaQuery()
                .eq(StringUtils.hasText(query.getDeviceType()), MesCollectDevice::getDeviceType, query.getDeviceType())
                .eq(StringUtils.hasText(query.getDeviceStatus()), MesCollectDevice::getDeviceStatus, query.getDeviceStatus())
                .eq(StringUtils.hasText(query.getProtocol()), MesCollectDevice::getProtocol, query.getProtocol())
                .eq(StringUtils.hasText(query.getDeviceCode()), MesCollectDevice::getDeviceCode, query.getDeviceCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesCollectDevice::getDeviceNo, keyword).or()
                        .like(MesCollectDevice::getDeviceCode, keyword).or()
                        .like(MesCollectDevice::getDeviceName, keyword).or()
                        .like(MesCollectDevice::getGatewayCode, keyword))
                .orderByDesc(MesCollectDevice::getId));
        return PageResult.of(page);
    }

    public MesCollectDevice detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesCollectDeviceSaveRequest request) {
        MesCollectDevice entity;
        if (id == null) {
            entity = new MesCollectDevice();
            entity.setDeviceNo(StringUtils.hasText(request.getDeviceNo())
                    ? request.getDeviceNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setDeviceType(StringUtils.hasText(request.getDeviceType())
                    ? request.getDeviceType() : DEFAULT_DEVICE_TYPE);
            entity.setDeviceStatus(StringUtils.hasText(request.getDeviceStatus())
                    ? request.getDeviceStatus() : DEFAULT_DEVICE_STATUS);
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

    private MesCollectDevice require(Long id) {
        MesCollectDevice entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "采集设备不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesCollectDevice entity, MesCollectDeviceSaveRequest request) {
        if (StringUtils.hasText(request.getDeviceNo())) {
            entity.setDeviceNo(request.getDeviceNo());
        }
        if (StringUtils.hasText(request.getDeviceCode())) {
            entity.setDeviceCode(request.getDeviceCode());
        }
        if (StringUtils.hasText(request.getDeviceName())) {
            entity.setDeviceName(request.getDeviceName());
        }
        if (StringUtils.hasText(request.getDeviceType())) {
            entity.setDeviceType(request.getDeviceType());
        }
        if (StringUtils.hasText(request.getModel())) {
            entity.setModel(request.getModel());
        }
        if (StringUtils.hasText(request.getVendor())) {
            entity.setVendor(request.getVendor());
        }
        if (StringUtils.hasText(request.getProtocol())) {
            entity.setProtocol(request.getProtocol());
        }
        if (StringUtils.hasText(request.getIpAddress())) {
            entity.setIpAddress(request.getIpAddress());
        }
        if (request.getPort() != null) {
            entity.setPort(request.getPort());
        }
        if (StringUtils.hasText(request.getGatewayCode())) {
            entity.setGatewayCode(request.getGatewayCode());
        }
        if (StringUtils.hasText(request.getLocation())) {
            entity.setLocation(request.getLocation());
        }
        if (StringUtils.hasText(request.getDeviceStatus())) {
            entity.setDeviceStatus(request.getDeviceStatus());
        }
        if (request.getInstallDate() != null) {
            entity.setInstallDate(request.getInstallDate());
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
