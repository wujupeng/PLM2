package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsStocktakeOrderQuery;
import com.huaweicloud.plm.system.dto.WmsStocktakeOrderSaveRequest;
import com.huaweicloud.plm.system.entity.WmsStocktakeOrder;
import com.huaweicloud.plm.system.mapper.WmsStocktakeOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 盘点单服务。
 */
@Service
@RequiredArgsConstructor
public class WmsStocktakeOrderService {

    private static final String DEFAULT_NO_PREFIX = "STK";
    private static final String DEFAULT_STOCKTAKE_TYPE = "CYCLE";
    private static final String DEFAULT_STOCKTAKE_STATUS = "DRAFT";

    private final WmsStocktakeOrderMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<WmsStocktakeOrder> page(WmsStocktakeOrderQuery query) {
        String keyword = query.getKeyword();
        Page<WmsStocktakeOrder> page = mapper.selectPage(query.toPage(), Wrappers.<WmsStocktakeOrder>lambdaQuery()
                .eq(StringUtils.hasText(query.getStocktakeStatus()), WmsStocktakeOrder::getStocktakeStatus, query.getStocktakeStatus())
                .eq(StringUtils.hasText(query.getStocktakeType()), WmsStocktakeOrder::getStocktakeType, query.getStocktakeType())
                .eq(StringUtils.hasText(query.getWarehouseCode()), WmsStocktakeOrder::getWarehouseCode, query.getWarehouseCode())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsStocktakeOrder::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(WmsStocktakeOrder::getStocktakeNo, keyword).or()
                        .like(WmsStocktakeOrder::getWarehouseCode, keyword).or()
                        .like(WmsStocktakeOrder::getMaterialCode, keyword).or()
                        .like(WmsStocktakeOrder::getMaterialName, keyword))
                .orderByDesc(WmsStocktakeOrder::getId));
        return PageResult.of(page);
    }

    public WmsStocktakeOrder detail(Long id) {
        return require(id);
    }

    public Long save(Long id, WmsStocktakeOrderSaveRequest request) {
        WmsStocktakeOrder entity;
        if (id == null) {
            entity = new WmsStocktakeOrder();
            entity.setStocktakeNo(StringUtils.hasText(request.getStocktakeNo())
                    ? request.getStocktakeNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setStocktakeType(StringUtils.hasText(request.getStocktakeType())
                    ? request.getStocktakeType() : DEFAULT_STOCKTAKE_TYPE);
            entity.setStocktakeStatus(StringUtils.hasText(request.getStocktakeStatus())
                    ? request.getStocktakeStatus() : DEFAULT_STOCKTAKE_STATUS);
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

    private WmsStocktakeOrder require(Long id) {
        WmsStocktakeOrder entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "盘点单不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(WmsStocktakeOrder entity, WmsStocktakeOrderSaveRequest request) {
        if (StringUtils.hasText(request.getStocktakeNo())) {
            entity.setStocktakeNo(request.getStocktakeNo());
        }
        if (StringUtils.hasText(request.getStocktakeType())) {
            entity.setStocktakeType(request.getStocktakeType());
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
        if (request.getBookQty() != null) {
            entity.setBookQty(request.getBookQty());
        }
        if (request.getCountedQty() != null) {
            entity.setCountedQty(request.getCountedQty());
        }
        if (request.getDiffQty() != null) {
            entity.setDiffQty(request.getDiffQty());
        }
        if (StringUtils.hasText(request.getStocktakeStatus())) {
            entity.setStocktakeStatus(request.getStocktakeStatus());
        }
        if (StringUtils.hasText(request.getCountBy())) {
            entity.setCountBy(request.getCountBy());
        }
        if (request.getCountTime() != null) {
            entity.setCountTime(request.getCountTime());
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
