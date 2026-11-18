package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsVmiScanQuery;
import com.huaweicloud.plm.system.dto.WmsVmiScanSaveRequest;
import com.huaweicloud.plm.system.entity.WmsVmiScan;
import com.huaweicloud.plm.system.mapper.WmsVmiScanMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * VMI 扫码收发服务。
 */
@Service
@RequiredArgsConstructor
public class WmsVmiScanService {

    private static final String DEFAULT_NO_PREFIX = "VSC";
    private static final String DEFAULT_SCAN_TYPE = "IN";
    private static final String DEFAULT_SCAN_STATUS = "DRAFT";

    private final WmsVmiScanMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<WmsVmiScan> page(WmsVmiScanQuery query) {
        String keyword = query.getKeyword();
        Page<WmsVmiScan> page = mapper.selectPage(query.toPage(), Wrappers.<WmsVmiScan>lambdaQuery()
                .eq(StringUtils.hasText(query.getScanStatus()), WmsVmiScan::getScanStatus, query.getScanStatus())
                .eq(StringUtils.hasText(query.getScanType()), WmsVmiScan::getScanType, query.getScanType())
                .eq(StringUtils.hasText(query.getWarehouseCode()), WmsVmiScan::getWarehouseCode, query.getWarehouseCode())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsVmiScan::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(WmsVmiScan::getScanNo, keyword).or()
                        .like(WmsVmiScan::getWarehouseCode, keyword).or()
                        .like(WmsVmiScan::getBinCode, keyword).or()
                        .like(WmsVmiScan::getMaterialCode, keyword).or()
                        .like(WmsVmiScan::getMaterialName, keyword))
                .orderByDesc(WmsVmiScan::getId));
        return PageResult.of(page);
    }

    public WmsVmiScan detail(Long id) {
        return require(id);
    }

    public Long save(Long id, WmsVmiScanSaveRequest request) {
        WmsVmiScan entity;
        if (id == null) {
            entity = new WmsVmiScan();
            entity.setScanNo(StringUtils.hasText(request.getScanNo())
                    ? request.getScanNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setScanType(StringUtils.hasText(request.getScanType())
                    ? request.getScanType() : DEFAULT_SCAN_TYPE);
            entity.setScanStatus(StringUtils.hasText(request.getScanStatus())
                    ? request.getScanStatus() : DEFAULT_SCAN_STATUS);
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

    private WmsVmiScan require(Long id) {
        WmsVmiScan entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "VMI扫码单不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(WmsVmiScan entity, WmsVmiScanSaveRequest request) {
        if (StringUtils.hasText(request.getScanNo())) {
            entity.setScanNo(request.getScanNo());
        }
        if (StringUtils.hasText(request.getScanType())) {
            entity.setScanType(request.getScanType());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getBinCode())) {
            entity.setBinCode(request.getBinCode());
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
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (StringUtils.hasText(request.getPalletNo())) {
            entity.setPalletNo(request.getPalletNo());
        }
        if (request.getScanQty() != null) {
            entity.setScanQty(request.getScanQty());
        }
        if (request.getOnHandQty() != null) {
            entity.setOnHandQty(request.getOnHandQty());
        }
        if (StringUtils.hasText(request.getScanStatus())) {
            entity.setScanStatus(request.getScanStatus());
        }
        if (StringUtils.hasText(request.getOperator())) {
            entity.setOperator(request.getOperator());
        }
        if (request.getScanTime() != null) {
            entity.setScanTime(request.getScanTime());
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
