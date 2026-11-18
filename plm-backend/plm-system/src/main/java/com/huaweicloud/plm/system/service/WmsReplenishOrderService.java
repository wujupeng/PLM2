package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsReplenishOrderQuery;
import com.huaweicloud.plm.system.dto.WmsReplenishOrderSaveRequest;
import com.huaweicloud.plm.system.entity.WmsReplenishOrder;
import com.huaweicloud.plm.system.mapper.WmsReplenishOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 生产补料单服务。
 */
@Service
@RequiredArgsConstructor
public class WmsReplenishOrderService {

    private static final String DEFAULT_NO_PREFIX = "RPL";
    private static final String DEFAULT_REPLENISH_TYPE = "REPLENISH";
    private static final String DEFAULT_REPLENISH_STATUS = "DRAFT";

    private final WmsReplenishOrderMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<WmsReplenishOrder> page(WmsReplenishOrderQuery query) {
        String keyword = query.getKeyword();
        Page<WmsReplenishOrder> page = mapper.selectPage(query.toPage(), Wrappers.<WmsReplenishOrder>lambdaQuery()
                .eq(StringUtils.hasText(query.getReplenishStatus()), WmsReplenishOrder::getReplenishStatus, query.getReplenishStatus())
                .eq(StringUtils.hasText(query.getReplenishType()), WmsReplenishOrder::getReplenishType, query.getReplenishType())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), WmsReplenishOrder::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsReplenishOrder::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(WmsReplenishOrder::getReplenishNo, keyword).or()
                        .like(WmsReplenishOrder::getWorkOrderNo, keyword).or()
                        .like(WmsReplenishOrder::getMaterialCode, keyword).or()
                        .like(WmsReplenishOrder::getMaterialName, keyword))
                .orderByDesc(WmsReplenishOrder::getId));
        return PageResult.of(page);
    }

    public WmsReplenishOrder detail(Long id) {
        return require(id);
    }

    public Long save(Long id, WmsReplenishOrderSaveRequest request) {
        WmsReplenishOrder entity;
        if (id == null) {
            entity = new WmsReplenishOrder();
            entity.setReplenishNo(StringUtils.hasText(request.getReplenishNo())
                    ? request.getReplenishNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setReplenishType(StringUtils.hasText(request.getReplenishType())
                    ? request.getReplenishType() : DEFAULT_REPLENISH_TYPE);
            entity.setReplenishStatus(StringUtils.hasText(request.getReplenishStatus())
                    ? request.getReplenishStatus() : DEFAULT_REPLENISH_STATUS);
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

    private WmsReplenishOrder require(Long id) {
        WmsReplenishOrder entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "生产补料单不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(WmsReplenishOrder entity, WmsReplenishOrderSaveRequest request) {
        if (StringUtils.hasText(request.getReplenishNo())) {
            entity.setReplenishNo(request.getReplenishNo());
        }
        if (StringUtils.hasText(request.getReplenishType())) {
            entity.setReplenishType(request.getReplenishType());
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
        if (request.getPlanQty() != null) {
            entity.setPlanQty(request.getPlanQty());
        }
        if (request.getReplenishQty() != null) {
            entity.setReplenishQty(request.getReplenishQty());
        }
        if (request.getIssuedQty() != null) {
            entity.setIssuedQty(request.getIssuedQty());
        }
        if (StringUtils.hasText(request.getReplenishReason())) {
            entity.setReplenishReason(request.getReplenishReason());
        }
        if (StringUtils.hasText(request.getReplenishStatus())) {
            entity.setReplenishStatus(request.getReplenishStatus());
        }
        if (StringUtils.hasText(request.getApplyBy())) {
            entity.setApplyBy(request.getApplyBy());
        }
        if (request.getApplyTime() != null) {
            entity.setApplyTime(request.getApplyTime());
        }
        if (StringUtils.hasText(request.getIssueBy())) {
            entity.setIssueBy(request.getIssueBy());
        }
        if (request.getIssueTime() != null) {
            entity.setIssueTime(request.getIssueTime());
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
