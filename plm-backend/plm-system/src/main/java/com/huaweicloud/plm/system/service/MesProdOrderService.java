package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesProdOrderQuery;
import com.huaweicloud.plm.system.dto.MesProdOrderSaveRequest;
import com.huaweicloud.plm.system.entity.MesProdOrder;
import com.huaweicloud.plm.system.mapper.MesProdOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 生产工单服务。
 */
@Service
@RequiredArgsConstructor
public class MesProdOrderService {

    private static final String DEFAULT_NO_PREFIX = "MPO";
    private static final String DEFAULT_ORDER_SOURCE = "ERP";
    private static final String DEFAULT_ORDER_STATUS = "DRAFT";
    private static final String DEFAULT_PRIORITY = "NORMAL";

    private final MesProdOrderMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesProdOrder> page(MesProdOrderQuery query) {
        String keyword = query.getKeyword();
        Page<MesProdOrder> page = mapper.selectPage(query.toPage(), Wrappers.<MesProdOrder>lambdaQuery()
                .eq(StringUtils.hasText(query.getOrderStatus()), MesProdOrder::getOrderStatus, query.getOrderStatus())
                .eq(StringUtils.hasText(query.getPriority()), MesProdOrder::getPriority, query.getPriority())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesProdOrder::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getWorkshopCode()), MesProdOrder::getWorkshopCode, query.getWorkshopCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesProdOrder::getOrderNo, keyword).or()
                        .like(MesProdOrder::getErpOrderNo, keyword).or()
                        .like(MesProdOrder::getMaterialCode, keyword).or()
                        .like(MesProdOrder::getMaterialName, keyword))
                .orderByDesc(MesProdOrder::getId));
        return PageResult.of(page);
    }

    public MesProdOrder detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesProdOrderSaveRequest request) {
        MesProdOrder entity;
        if (id == null) {
            entity = new MesProdOrder();
            entity.setOrderNo(StringUtils.hasText(request.getOrderNo())
                    ? request.getOrderNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setOrderSource(StringUtils.hasText(request.getOrderSource())
                    ? request.getOrderSource() : DEFAULT_ORDER_SOURCE);
            entity.setOrderStatus(StringUtils.hasText(request.getOrderStatus())
                    ? request.getOrderStatus() : DEFAULT_ORDER_STATUS);
            entity.setPriority(StringUtils.hasText(request.getPriority())
                    ? request.getPriority() : DEFAULT_PRIORITY);
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

    private MesProdOrder require(Long id) {
        MesProdOrder entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "生产工单不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesProdOrder entity, MesProdOrderSaveRequest request) {
        if (StringUtils.hasText(request.getOrderNo())) {
            entity.setOrderNo(request.getOrderNo());
        }
        if (StringUtils.hasText(request.getErpOrderNo())) {
            entity.setErpOrderNo(request.getErpOrderNo());
        }
        if (StringUtils.hasText(request.getOrderSource())) {
            entity.setOrderSource(request.getOrderSource());
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
        if (request.getPlanQty() != null) {
            entity.setPlanQty(request.getPlanQty());
        }
        if (request.getProductQty() != null) {
            entity.setProductQty(request.getProductQty());
        }
        if (StringUtils.hasText(request.getOrderStatus())) {
            entity.setOrderStatus(request.getOrderStatus());
        }
        if (StringUtils.hasText(request.getPriority())) {
            entity.setPriority(request.getPriority());
        }
        if (StringUtils.hasText(request.getWorkshopCode())) {
            entity.setWorkshopCode(request.getWorkshopCode());
        }
        if (request.getPlanStartTime() != null) {
            entity.setPlanStartTime(request.getPlanStartTime());
        }
        if (request.getPlanEndTime() != null) {
            entity.setPlanEndTime(request.getPlanEndTime());
        }
        if (request.getReceiveTime() != null) {
            entity.setReceiveTime(request.getReceiveTime());
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
