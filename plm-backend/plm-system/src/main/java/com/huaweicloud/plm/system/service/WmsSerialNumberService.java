package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsSerialNumberQuery;
import com.huaweicloud.plm.system.dto.WmsSerialNumberSaveRequest;
import com.huaweicloud.plm.system.entity.WmsSerialNumber;
import com.huaweicloud.plm.system.mapper.WmsSerialNumberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 序列号服务（对应序列号）。
 */
@Service
@RequiredArgsConstructor
public class WmsSerialNumberService {

    private static final String DEFAULT_NO_PREFIX = "SNR";
    private static final String DEFAULT_SERIAL_STATUS = "IN_STOCK";

    private final WmsSerialNumberMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<WmsSerialNumber> page(WmsSerialNumberQuery query) {
        String keyword = query.getKeyword();
        Page<WmsSerialNumber> page = mapper.selectPage(query.toPage(), Wrappers.<WmsSerialNumber>lambdaQuery()
                .eq(StringUtils.hasText(query.getSerialStatus()), WmsSerialNumber::getSerialStatus, query.getSerialStatus())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsSerialNumber::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getBatchNo()), WmsSerialNumber::getBatchNo, query.getBatchNo())
                .eq(StringUtils.hasText(query.getWarehouseCode()), WmsSerialNumber::getWarehouseCode, query.getWarehouseCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(WmsSerialNumber::getSerialNo, keyword).or()
                        .like(WmsSerialNumber::getMaterialCode, keyword).or()
                        .like(WmsSerialNumber::getMaterialName, keyword).or()
                        .like(WmsSerialNumber::getBatchNo, keyword))
                .orderByDesc(WmsSerialNumber::getId));
        return PageResult.of(page);
    }

    public WmsSerialNumber detail(Long id) {
        return require(id);
    }

    public Long save(Long id, WmsSerialNumberSaveRequest request) {
        WmsSerialNumber entity;
        if (id == null) {
            entity = new WmsSerialNumber();
            entity.setSerialNo(StringUtils.hasText(request.getSerialNo())
                    ? request.getSerialNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setSerialStatus(StringUtils.hasText(request.getSerialStatus())
                    ? request.getSerialStatus()
                    : DEFAULT_SERIAL_STATUS);
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

    private WmsSerialNumber require(Long id) {
        WmsSerialNumber entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "序列号不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(WmsSerialNumber entity, WmsSerialNumberSaveRequest request) {
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getSpec())) {
            entity.setSpec(request.getSpec());
        }
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getBinCode())) {
            entity.setBinCode(request.getBinCode());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getReceiptNo())) {
            entity.setReceiptNo(request.getReceiptNo());
        }
        if (request.getInboundTime() != null) {
            entity.setInboundTime(request.getInboundTime());
        }
        if (StringUtils.hasText(request.getCustomerCode())) {
            entity.setCustomerCode(request.getCustomerCode());
        }
        if (request.getOutboundTime() != null) {
            entity.setOutboundTime(request.getOutboundTime());
        }
        if (StringUtils.hasText(request.getSerialStatus())) {
            entity.setSerialStatus(request.getSerialStatus());
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
