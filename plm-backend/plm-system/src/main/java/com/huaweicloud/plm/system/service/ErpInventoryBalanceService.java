package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpInventoryBalanceQuery;
import com.huaweicloud.plm.system.dto.ErpInventoryBalanceSaveRequest;
import com.huaweicloud.plm.system.entity.ErpInventoryBalance;
import com.huaweicloud.plm.system.mapper.ErpInventoryBalanceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 库存核算—库存余额（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 收发存台账登记、分页查询与删除。
 * 本表无单据号字段，删除采用逻辑删除。
 */
@Service
@RequiredArgsConstructor
public class ErpInventoryBalanceService {

    private static final String DEFAULT_UOM = "PCS";

    private final ErpInventoryBalanceMapper mapper;

    /** 分页查询库存余额：仓库/物料/批次精确，物料编码/物料名称/仓库名称模糊，按主键倒序。 */
    public PageResult<ErpInventoryBalance> page(ErpInventoryBalanceQuery query) {
        Page<ErpInventoryBalance> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpInventoryBalance>lambdaQuery()
                .eq(StringUtils.hasText(query.getWarehouseCode()),
                        ErpInventoryBalance::getWarehouseCode, query.getWarehouseCode())
                .eq(StringUtils.hasText(query.getMaterialCode()),
                        ErpInventoryBalance::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getBatchNo()),
                        ErpInventoryBalance::getBatchNo, query.getBatchNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpInventoryBalance::getMaterialCode, query.getKeyword()).or()
                        .like(ErpInventoryBalance::getMaterialName, query.getKeyword()).or()
                        .like(ErpInventoryBalance::getWarehouseName, query.getKeyword()))
                .orderByDesc(ErpInventoryBalance::getId));
        return PageResult.of(page);
    }

    public ErpInventoryBalance detail(Long id) {
        return require(id);
    }

    /** 新增或更新库存余额：新增时回填默认单位/库位/批次/数量与组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpInventoryBalanceSaveRequest request) {
        ErpInventoryBalance entity;
        if (id == null) {
            entity = new ErpInventoryBalance();
            entity.setUom(StringUtils.hasText(request.getUom())
                    ? request.getUom() : DEFAULT_UOM);
            entity.setLocationCode(StringUtils.hasText(request.getLocationCode())
                    ? request.getLocationCode() : "");
            entity.setBatchNo(StringUtils.hasText(request.getBatchNo())
                    ? request.getBatchNo() : "");
            entity.setOnHandQty(request.getOnHandQty() != null
                    ? request.getOnHandQty() : BigDecimal.ZERO);
            entity.setLockedQty(request.getLockedQty() != null
                    ? request.getLockedQty() : BigDecimal.ZERO);
            entity.setAvailableQty(request.getAvailableQty() != null
                    ? request.getAvailableQty() : BigDecimal.ZERO);
            entity.setInTransitQty(request.getInTransitQty() != null
                    ? request.getInTransitQty() : BigDecimal.ZERO);
            entity.setAvgCost(request.getAvgCost() != null
                    ? request.getAvgCost() : BigDecimal.ZERO);
            entity.setAmount(request.getAmount() != null
                    ? request.getAmount() : BigDecimal.ZERO);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
        }
        applyRequest(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 删除库存余额：本表无单据号，采用逻辑删除。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.deleteById(id);
    }

    public ErpInventoryBalance require(Long id) {
        ErpInventoryBalance entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "库存余额不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpInventoryBalance entity, ErpInventoryBalanceSaveRequest request) {
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getSpec())) {
            entity.setSpec(request.getSpec());
        }
        if (StringUtils.hasText(request.getUom())) {
            entity.setUom(request.getUom());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getWarehouseName())) {
            entity.setWarehouseName(request.getWarehouseName());
        }
        if (StringUtils.hasText(request.getLocationCode())) {
            entity.setLocationCode(request.getLocationCode());
        }
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (request.getOnHandQty() != null) {
            entity.setOnHandQty(request.getOnHandQty());
        }
        if (request.getLockedQty() != null) {
            entity.setLockedQty(request.getLockedQty());
        }
        if (request.getAvailableQty() != null) {
            entity.setAvailableQty(request.getAvailableQty());
        }
        if (request.getInTransitQty() != null) {
            entity.setInTransitQty(request.getInTransitQty());
        }
        if (request.getAvgCost() != null) {
            entity.setAvgCost(request.getAvgCost());
        }
        if (request.getAmount() != null) {
            entity.setAmount(request.getAmount());
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
