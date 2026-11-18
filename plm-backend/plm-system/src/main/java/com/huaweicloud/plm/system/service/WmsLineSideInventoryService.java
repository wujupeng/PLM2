package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsLineSideInventoryQuery;
import com.huaweicloud.plm.system.dto.WmsLineSideInventorySaveRequest;
import com.huaweicloud.plm.system.entity.WmsLineSideInventory;
import com.huaweicloud.plm.system.mapper.WmsLineSideInventoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 线边仓库存服务。
 */
@Service
@RequiredArgsConstructor
public class WmsLineSideInventoryService {

    private static final String DEFAULT_STOCK_STATUS = "NORMAL";

    private final WmsLineSideInventoryMapper mapper;

    public PageResult<WmsLineSideInventory> page(WmsLineSideInventoryQuery query) {
        String keyword = query.getKeyword();
        Page<WmsLineSideInventory> page = mapper.selectPage(query.toPage(), Wrappers.<WmsLineSideInventory>lambdaQuery()
                .eq(StringUtils.hasText(query.getStockStatus()), WmsLineSideInventory::getStockStatus, query.getStockStatus())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsLineSideInventory::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getLineCode()), WmsLineSideInventory::getLineCode, query.getLineCode())
                .eq(StringUtils.hasText(query.getWarehouseCode()), WmsLineSideInventory::getWarehouseCode, query.getWarehouseCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(WmsLineSideInventory::getMaterialCode, keyword).or()
                        .like(WmsLineSideInventory::getMaterialName, keyword).or()
                        .like(WmsLineSideInventory::getBatchNo, keyword).or()
                        .like(WmsLineSideInventory::getBinCode, keyword).or()
                        .like(WmsLineSideInventory::getLineCode, keyword))
                .orderByDesc(WmsLineSideInventory::getId));
        return PageResult.of(page);
    }

    public WmsLineSideInventory detail(Long id) {
        return require(id);
    }

    public Long save(Long id, WmsLineSideInventorySaveRequest request) {
        WmsLineSideInventory entity;
        if (id == null) {
            entity = new WmsLineSideInventory();
            entity.setStockStatus(StringUtils.hasText(request.getStockStatus())
                    ? request.getStockStatus() : DEFAULT_STOCK_STATUS);
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

    private WmsLineSideInventory require(Long id) {
        WmsLineSideInventory entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "线边仓库存不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(WmsLineSideInventory entity, WmsLineSideInventorySaveRequest request) {
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
        if (StringUtils.hasText(request.getLineCode())) {
            entity.setLineCode(request.getLineCode());
        }
        if (StringUtils.hasText(request.getBinCode())) {
            entity.setBinCode(request.getBinCode());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (request.getQty() != null) {
            entity.setQty(request.getQty());
        }
        if (request.getAvailableQty() != null) {
            entity.setAvailableQty(request.getAvailableQty());
        }
        if (request.getFrozenQty() != null) {
            entity.setFrozenQty(request.getFrozenQty());
        }
        if (request.getMinQty() != null) {
            entity.setMinQty(request.getMinQty());
        }
        if (request.getMaxQty() != null) {
            entity.setMaxQty(request.getMaxQty());
        }
        if (StringUtils.hasText(request.getStockStatus())) {
            entity.setStockStatus(request.getStockStatus());
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
