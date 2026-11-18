package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpSalesOutboundQuery;
import com.huaweicloud.plm.system.dto.ErpSalesOutboundSaveRequest;
import com.huaweicloud.plm.system.entity.ErpSalesOutbound;
import com.huaweicloud.plm.system.mapper.ErpSalesOutboundMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 销售管理—销售出库（G3-N2 ERP 销售管理）：
 * 出库单登记、分页查询与删除。
 * 出库单号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpSalesOutboundService {

    private static final String DEFAULT_OUTBOUND_NO_PREFIX = "SOB";
    private static final String DEFAULT_OUTBOUND_STATUS = "DRAFT";

    private final ErpSalesOutboundMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询销售出库：状态/订单号/发货单号/客户编码精确，单号/订单号/发货单号模糊，按主键倒序。 */
    public PageResult<ErpSalesOutbound> pageOutbounds(ErpSalesOutboundQuery query) {
        Page<ErpSalesOutbound> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpSalesOutbound>lambdaQuery()
                .eq(StringUtils.hasText(query.getOutboundStatus()),
                        ErpSalesOutbound::getOutboundStatus, query.getOutboundStatus())
                .eq(StringUtils.hasText(query.getOrderNo()),
                        ErpSalesOutbound::getOrderNo, query.getOrderNo())
                .eq(StringUtils.hasText(query.getDeliveryNo()),
                        ErpSalesOutbound::getDeliveryNo, query.getDeliveryNo())
                .eq(StringUtils.hasText(query.getCustomerCode()),
                        ErpSalesOutbound::getCustomerCode, query.getCustomerCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpSalesOutbound::getOutboundNo, query.getKeyword()).or()
                        .like(ErpSalesOutbound::getOrderNo, query.getKeyword()).or()
                        .like(ErpSalesOutbound::getDeliveryNo, query.getKeyword()))
                .orderByDesc(ErpSalesOutbound::getId));
        return PageResult.of(page);
    }

    public ErpSalesOutbound detail(Long id) {
        return require(id);
    }

    /** 新增或更新销售出库：新增时回填默认出库数量/状态与组织，单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpSalesOutboundSaveRequest request) {
        ErpSalesOutbound entity;
        if (id == null) {
            entity = new ErpSalesOutbound();
            entity.setOutboundNo(StringUtils.hasText(request.getOutboundNo())
                    ? request.getOutboundNo() : flowSupport.nextBizNo(DEFAULT_OUTBOUND_NO_PREFIX));
            entity.setOutboundQty(request.getOutboundQty() != null ? request.getOutboundQty() : BigDecimal.ZERO);
            entity.setOutboundStatus(StringUtils.hasText(request.getOutboundStatus())
                    ? request.getOutboundStatus() : DEFAULT_OUTBOUND_STATUS);
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

    /** 删除销售出库：物理删除以释放出库单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpSalesOutbound require(Long id) {
        ErpSalesOutbound entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "销售出库不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpSalesOutbound entity, ErpSalesOutboundSaveRequest request) {
        if (StringUtils.hasText(request.getOutboundNo())) {
            entity.setOutboundNo(request.getOutboundNo());
        }
        if (StringUtils.hasText(request.getDeliveryNo())) {
            entity.setDeliveryNo(request.getDeliveryNo());
        }
        if (StringUtils.hasText(request.getOrderNo())) {
            entity.setOrderNo(request.getOrderNo());
        }
        if (StringUtils.hasText(request.getCustomerCode())) {
            entity.setCustomerCode(request.getCustomerCode());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (request.getOutboundDate() != null) {
            entity.setOutboundDate(request.getOutboundDate());
        }
        if (request.getOutboundQty() != null) {
            entity.setOutboundQty(request.getOutboundQty());
        }
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (StringUtils.hasText(request.getOperatorName())) {
            entity.setOperatorName(request.getOperatorName());
        }
        if (StringUtils.hasText(request.getOutboundStatus())) {
            entity.setOutboundStatus(request.getOutboundStatus());
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
