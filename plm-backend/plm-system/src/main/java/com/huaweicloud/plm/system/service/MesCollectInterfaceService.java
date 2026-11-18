package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesCollectInterfaceQuery;
import com.huaweicloud.plm.system.dto.MesCollectInterfaceSaveRequest;
import com.huaweicloud.plm.system.entity.MesCollectInterface;
import com.huaweicloud.plm.system.mapper.MesCollectInterfaceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * PLC/网关采集接口记录服务。
 */
@Service
@RequiredArgsConstructor
public class MesCollectInterfaceService {

    private static final String DEFAULT_NO_PREFIX = "MCI";
    private static final String DEFAULT_INTERFACE_STATUS = "OFFLINE";

    private final MesCollectInterfaceMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesCollectInterface> page(MesCollectInterfaceQuery query) {
        String keyword = query.getKeyword();
        Page<MesCollectInterface> page = mapper.selectPage(query.toPage(), Wrappers.<MesCollectInterface>lambdaQuery()
                .eq(StringUtils.hasText(query.getInterfaceStatus()), MesCollectInterface::getInterfaceStatus, query.getInterfaceStatus())
                .eq(StringUtils.hasText(query.getProtocol()), MesCollectInterface::getProtocol, query.getProtocol())
                .eq(StringUtils.hasText(query.getDeviceCode()), MesCollectInterface::getDeviceCode, query.getDeviceCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesCollectInterface::getInterfaceNo, keyword).or()
                        .like(MesCollectInterface::getInterfaceName, keyword).or()
                        .like(MesCollectInterface::getDeviceCode, keyword).or()
                        .like(MesCollectInterface::getEndpoint, keyword))
                .orderByDesc(MesCollectInterface::getId));
        return PageResult.of(page);
    }

    public MesCollectInterface detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesCollectInterfaceSaveRequest request) {
        MesCollectInterface entity;
        if (id == null) {
            entity = new MesCollectInterface();
            entity.setInterfaceNo(StringUtils.hasText(request.getInterfaceNo())
                    ? request.getInterfaceNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setInterfaceStatus(StringUtils.hasText(request.getInterfaceStatus())
                    ? request.getInterfaceStatus() : DEFAULT_INTERFACE_STATUS);
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

    private MesCollectInterface require(Long id) {
        MesCollectInterface entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "采集接口不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesCollectInterface entity, MesCollectInterfaceSaveRequest request) {
        if (StringUtils.hasText(request.getInterfaceNo())) {
            entity.setInterfaceNo(request.getInterfaceNo());
        }
        if (StringUtils.hasText(request.getInterfaceName())) {
            entity.setInterfaceName(request.getInterfaceName());
        }
        if (StringUtils.hasText(request.getDeviceNo())) {
            entity.setDeviceNo(request.getDeviceNo());
        }
        if (StringUtils.hasText(request.getDeviceCode())) {
            entity.setDeviceCode(request.getDeviceCode());
        }
        if (StringUtils.hasText(request.getProtocol())) {
            entity.setProtocol(request.getProtocol());
        }
        if (StringUtils.hasText(request.getEndpoint())) {
            entity.setEndpoint(request.getEndpoint());
        }
        if (StringUtils.hasText(request.getAddress())) {
            entity.setAddress(request.getAddress());
        }
        if (StringUtils.hasText(request.getDataFormat())) {
            entity.setDataFormat(request.getDataFormat());
        }
        if (request.getSampleInterval() != null) {
            entity.setSampleInterval(request.getSampleInterval());
        }
        if (StringUtils.hasText(request.getInterfaceStatus())) {
            entity.setInterfaceStatus(request.getInterfaceStatus());
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
