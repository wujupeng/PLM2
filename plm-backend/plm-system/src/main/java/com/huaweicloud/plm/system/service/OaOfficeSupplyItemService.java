package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizOfficeSupplyItemSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaOfficeSupplyItem;
import com.huaweicloud.plm.system.mapper.OaOfficeSupplyItemMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

/**
 * 办公用品目录（OA-DEV-081）：用品档案维护与库存台账基础数据。
 * 库存数量与安全库存为台账参考值，是否启用库存管理由 oa.office.supply.stock.enabled 控制。
 */
@Service
@RequiredArgsConstructor
public class OaOfficeSupplyItemService {

    private final OaOfficeSupplyItemMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaOfficeSupplyItem> page(OaBizFlowQuery query) {
        Page<OaOfficeSupplyItem> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaOfficeSupplyItem>lambdaQuery()
                .eq(query.getTypeCode() != null && StringUtils.hasText(query.getTypeCode()),
                        OaOfficeSupplyItem::getCategory, query.getTypeCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaOfficeSupplyItem::getItemCode, query.getKeyword()).or()
                        .like(OaOfficeSupplyItem::getItemName, query.getKeyword()))
                .orderByAsc(OaOfficeSupplyItem::getItemCode)
                .orderByDesc(OaOfficeSupplyItem::getId));
        return PageResult.of(page);
    }

    /** 启用中的用品列表，供申请单选择。 */
    public List<OaOfficeSupplyItem> listEnabled() {
        return mapper.selectList(Wrappers.<OaOfficeSupplyItem>lambdaQuery()
                .eq(OaOfficeSupplyItem::getStatus, 1)
                .orderByAsc(OaOfficeSupplyItem::getItemCode));
    }

    public OaOfficeSupplyItem detail(Long id) {
        return requireEntity(id);
    }

    @Transactional
    public Long save(Long id, BizOfficeSupplyItemSaveRequest request) {
        if (!StringUtils.hasText(request.getItemName())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "物品名称不能为空");
        }
        OaOfficeSupplyItem entity;
        if (id == null) {
            entity = new OaOfficeSupplyItem();
            entity.setItemCode(StringUtils.hasText(request.getItemCode())
                    ? request.getItemCode() : flowSupport.nextBizNo("OSI"));
            entity.setOrgId(currentOrgId());
            entity.setStockQty(request.getStockQty() == null ? BigDecimal.ZERO : request.getStockQty());
        } else {
            entity = requireEntity(id);
            if (StringUtils.hasText(request.getItemCode())) {
                entity.setItemCode(request.getItemCode());
            }
        }
        entity.setItemName(request.getItemName());
        entity.setCategory(request.getCategory());
        entity.setSpecification(request.getSpecification());
        entity.setUnit(StringUtils.hasText(request.getUnit()) ? request.getUnit() : "PCS");
        entity.setUnitPrice(request.getUnitPrice());
        if (request.getStockQty() != null) {
            entity.setStockQty(request.getStockQty());
        }
        entity.setSafetyStock(request.getSafetyStock());
        entity.setNeedStock(Boolean.FALSE.equals(request.getNeedStock()) ? 0 : 1);
        entity.setStatus(request.getStatus() == null ? 1 : request.getStatus());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    @Transactional
    public void delete(Long id) {
        requireEntity(id);
        mapper.deleteById(id);
    }

    public OaOfficeSupplyItem requireEntity(Long id) {
        OaOfficeSupplyItem entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "办公用品不存在: " + id);
        }
        return entity;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
