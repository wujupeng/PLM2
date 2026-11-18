package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesSerialNumberQuery;
import com.huaweicloud.plm.system.dto.MesSerialNumberSaveRequest;
import com.huaweicloud.plm.system.entity.MesSerialNumber;
import com.huaweicloud.plm.system.mapper.MesSerialNumberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 序列号台账服务。
 */
@Service
@RequiredArgsConstructor
public class MesSerialNumberService {

    private static final String DEFAULT_NO_PREFIX = "MSN";
    private static final String DEFAULT_SERIAL_STATUS = "CREATED";

    private final MesSerialNumberMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesSerialNumber> page(MesSerialNumberQuery query) {
        String keyword = query.getKeyword();
        Page<MesSerialNumber> page = mapper.selectPage(query.toPage(), Wrappers.<MesSerialNumber>lambdaQuery()
                .eq(StringUtils.hasText(query.getSerialStatus()), MesSerialNumber::getSerialStatus, query.getSerialStatus())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesSerialNumber::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getBatchNo()), MesSerialNumber::getBatchNo, query.getBatchNo())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesSerialNumber::getSerialNo, keyword).or()
                        .like(MesSerialNumber::getMaterialCode, keyword).or()
                        .like(MesSerialNumber::getMaterialName, keyword).or()
                        .like(MesSerialNumber::getBatchNo, keyword))
                .orderByDesc(MesSerialNumber::getId));
        return PageResult.of(page);
    }

    public MesSerialNumber detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesSerialNumberSaveRequest request) {
        MesSerialNumber entity;
        if (id == null) {
            entity = new MesSerialNumber();
            entity.setSerialNo(StringUtils.hasText(request.getSerialNo())
                    ? request.getSerialNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setSerialStatus(StringUtils.hasText(request.getSerialStatus())
                    ? request.getSerialStatus() : DEFAULT_SERIAL_STATUS);
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

    private MesSerialNumber require(Long id) {
        MesSerialNumber entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "序列号台账不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesSerialNumber entity, MesSerialNumberSaveRequest request) {
        if (StringUtils.hasText(request.getSerialNo())) {
            entity.setSerialNo(request.getSerialNo());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (StringUtils.hasText(request.getSerialStatus())) {
            entity.setSerialStatus(request.getSerialStatus());
        }
        if (StringUtils.hasText(request.getWorkOrderNo())) {
            entity.setWorkOrderNo(request.getWorkOrderNo());
        }
        if (request.getProduceTime() != null) {
            entity.setProduceTime(request.getProduceTime());
        }
        if (request.getShipTime() != null) {
            entity.setShipTime(request.getShipTime());
        }
        if (StringUtils.hasText(request.getCustomerCode())) {
            entity.setCustomerCode(request.getCustomerCode());
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
