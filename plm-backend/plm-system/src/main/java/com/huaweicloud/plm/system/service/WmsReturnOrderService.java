package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsReturnOrderQuery;
import com.huaweicloud.plm.system.dto.WmsReturnOrderSaveRequest;
import com.huaweicloud.plm.system.entity.WmsReturnOrder;
import com.huaweicloud.plm.system.mapper.WmsReturnOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 生产退料单服务。
 */
@Service
@RequiredArgsConstructor
public class WmsReturnOrderService {

    private static final String DEFAULT_NO_PREFIX = "RTN";
    private static final String DEFAULT_RETURN_TYPE = "RETURN";
    private static final String DEFAULT_RETURN_STATUS = "DRAFT";

    private final WmsReturnOrderMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<WmsReturnOrder> page(WmsReturnOrderQuery query) {
        String keyword = query.getKeyword();
        Page<WmsReturnOrder> page = mapper.selectPage(query.toPage(), Wrappers.<WmsReturnOrder>lambdaQuery()
                .eq(StringUtils.hasText(query.getReturnStatus()), WmsReturnOrder::getReturnStatus, query.getReturnStatus())
                .eq(StringUtils.hasText(query.getReturnType()), WmsReturnOrder::getReturnType, query.getReturnType())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), WmsReturnOrder::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsReturnOrder::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(WmsReturnOrder::getReturnNo, keyword).or()
                        .like(WmsReturnOrder::getWorkOrderNo, keyword).or()
                        .like(WmsReturnOrder::getMaterialCode, keyword).or()
                        .like(WmsReturnOrder::getMaterialName, keyword))
                .orderByDesc(WmsReturnOrder::getId));
        return PageResult.of(page);
    }

    public WmsReturnOrder detail(Long id) {
        return require(id);
    }

    public Long save(Long id, WmsReturnOrderSaveRequest request) {
        WmsReturnOrder entity;
        if (id == null) {
            entity = new WmsReturnOrder();
            entity.setReturnNo(StringUtils.hasText(request.getReturnNo())
                    ? request.getReturnNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setReturnType(StringUtils.hasText(request.getReturnType())
                    ? request.getReturnType() : DEFAULT_RETURN_TYPE);
            entity.setReturnStatus(StringUtils.hasText(request.getReturnStatus())
                    ? request.getReturnStatus() : DEFAULT_RETURN_STATUS);
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

    private WmsReturnOrder require(Long id) {
        WmsReturnOrder entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "生产退料单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/时间非空）时覆盖实体对应字段，不覆盖 orgId。 */
    private void applyRequest(WmsReturnOrder entity, WmsReturnOrderSaveRequest request) {
        if (StringUtils.hasText(request.getReturnNo())) {
            entity.setReturnNo(request.getReturnNo());
        }
        if (StringUtils.hasText(request.getReturnType())) {
            entity.setReturnType(request.getReturnType());
        }
        if (StringUtils.hasText(request.getWorkOrderNo())) {
            entity.setWorkOrderNo(request.getWorkOrderNo());
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
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getBinCode())) {
            entity.setBinCode(request.getBinCode());
        }
        if (request.getReturnQty() != null) {
            entity.setReturnQty(request.getReturnQty());
        }
        if (request.getReceivedQty() != null) {
            entity.setReceivedQty(request.getReceivedQty());
        }
        if (StringUtils.hasText(request.getReturnReason())) {
            entity.setReturnReason(request.getReturnReason());
        }
        if (StringUtils.hasText(request.getReturnStatus())) {
            entity.setReturnStatus(request.getReturnStatus());
        }
        if (StringUtils.hasText(request.getApplyBy())) {
            entity.setApplyBy(request.getApplyBy());
        }
        if (request.getApplyTime() != null) {
            entity.setApplyTime(request.getApplyTime());
        }
        if (StringUtils.hasText(request.getReceiveBy())) {
            entity.setReceiveBy(request.getReceiveBy());
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
