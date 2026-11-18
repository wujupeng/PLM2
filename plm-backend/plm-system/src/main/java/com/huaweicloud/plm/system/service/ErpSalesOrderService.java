package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpSalesOrderDetailResponse;
import com.huaweicloud.plm.system.dto.ErpSalesOrderLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpSalesOrderQuery;
import com.huaweicloud.plm.system.dto.ErpSalesOrderSaveRequest;
import com.huaweicloud.plm.system.entity.ErpSalesOrder;
import com.huaweicloud.plm.system.entity.ErpSalesOrderLine;
import com.huaweicloud.plm.system.mapper.ErpSalesOrderLineMapper;
import com.huaweicloud.plm.system.mapper.ErpSalesOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

/**
 * ERP 销售管理—销售订单（G3-N2 ERP 销售管理）：
 * 销售订单头与明细行的登记、分页查询、明细维护与删除。
 * 删除时先逻辑删除全部明细行，再物理删除订单头以释放订单编号。
 */
@Service
@RequiredArgsConstructor
public class ErpSalesOrderService {

    private static final String DEFAULT_ORDER_NO_PREFIX = "SO";
    private static final String DEFAULT_ORDER_TYPE = "STANDARD";
    private static final String DEFAULT_CURRENCY_CODE = "CNY";
    private static final String DEFAULT_PAYMENT_TERM = "NET30";
    private static final String DEFAULT_SETTLE_METHOD = "TRANSFER";
    private static final String DEFAULT_CREDIT_STATUS = "OK";
    private static final String DEFAULT_REVIEW_STATUS = "PENDING";
    private static final String DEFAULT_ORDER_STATUS = "DRAFT";
    private static final String DEFAULT_LINE_STATUS = "OPEN";
    private static final String DEFAULT_UOM = "PCS";

    private final ErpSalesOrderMapper mapper;
    private final ErpSalesOrderLineMapper lineMapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询销售订单：状态/审核状态/类型/客户编码精确，单号/客户名称模糊，按主键倒序。 */
    public PageResult<ErpSalesOrder> page(ErpSalesOrderQuery query) {
        Page<ErpSalesOrder> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpSalesOrder>lambdaQuery()
                .eq(StringUtils.hasText(query.getOrderStatus()),
                        ErpSalesOrder::getOrderStatus, query.getOrderStatus())
                .eq(StringUtils.hasText(query.getReviewStatus()),
                        ErpSalesOrder::getReviewStatus, query.getReviewStatus())
                .eq(StringUtils.hasText(query.getOrderType()),
                        ErpSalesOrder::getOrderType, query.getOrderType())
                .eq(StringUtils.hasText(query.getCustomerCode()),
                        ErpSalesOrder::getCustomerCode, query.getCustomerCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpSalesOrder::getOrderNo, query.getKeyword()).or()
                        .like(ErpSalesOrder::getCustomerName, query.getKeyword()))
                .orderByDesc(ErpSalesOrder::getId));
        return PageResult.of(page);
    }

    /** 订单详情：返回订单头与全部明细行。 */
    public ErpSalesOrderDetailResponse detail(Long id) {
        ErpSalesOrder header = require(id);
        ErpSalesOrderDetailResponse response = new ErpSalesOrderDetailResponse();
        response.setHeader(header);
        response.setLines(listLines(id));
        return response;
    }

    /** 新增销售订单：回填默认类型/币别/汇率/结算/状态/金额与组织，订单编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long create(ErpSalesOrderSaveRequest request) {
        ErpSalesOrder header = new ErpSalesOrder();
        header.setOrderNo(StringUtils.hasText(request.getOrderNo())
                ? request.getOrderNo() : flowSupport.nextBizNo(DEFAULT_ORDER_NO_PREFIX));
        header.setOrderType(StringUtils.hasText(request.getOrderType())
                ? request.getOrderType() : DEFAULT_ORDER_TYPE);
        header.setCurrencyCode(StringUtils.hasText(request.getCurrencyCode())
                ? request.getCurrencyCode() : DEFAULT_CURRENCY_CODE);
        header.setExchangeRate(request.getExchangeRate() != null
                ? request.getExchangeRate() : BigDecimal.ONE);
        header.setPaymentTerm(StringUtils.hasText(request.getPaymentTerm())
                ? request.getPaymentTerm() : DEFAULT_PAYMENT_TERM);
        header.setSettleMethod(StringUtils.hasText(request.getSettleMethod())
                ? request.getSettleMethod() : DEFAULT_SETTLE_METHOD);
        header.setCreditStatus(StringUtils.hasText(request.getCreditStatus())
                ? request.getCreditStatus() : DEFAULT_CREDIT_STATUS);
        header.setReviewStatus(StringUtils.hasText(request.getReviewStatus())
                ? request.getReviewStatus() : DEFAULT_REVIEW_STATUS);
        header.setOrderStatus(StringUtils.hasText(request.getOrderStatus())
                ? request.getOrderStatus() : DEFAULT_ORDER_STATUS);
        header.setTotalAmount(request.getTotalAmount() != null
                ? request.getTotalAmount() : BigDecimal.ZERO);
        header.setTaxAmount(request.getTaxAmount() != null
                ? request.getTaxAmount() : BigDecimal.ZERO);
        header.setNetAmount(request.getNetAmount() != null
                ? request.getNetAmount() : BigDecimal.ZERO);
        header.setDeliveredAmount(request.getDeliveredAmount() != null
                ? request.getDeliveredAmount() : BigDecimal.ZERO);
        header.setOrgId(currentOrgId());
        applyHeader(header, request);
        mapper.insert(header);
        return header.getId();
    }

    /** 更新销售订单头：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, ErpSalesOrderSaveRequest request) {
        ErpSalesOrder header = require(id);
        applyHeader(header, request);
        mapper.updateById(header);
    }

    /** 删除销售订单：先逻辑删除全部明细行，再物理删除订单头以释放订单编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        lineMapper.delete(Wrappers.<ErpSalesOrderLine>lambdaQuery().eq(ErpSalesOrderLine::getOrderId, id));
        mapper.physicalDeleteById(id);
    }

    /** 新增订单行：行号为空时取当前最大行号 +1，回填默认行状态/单位/数量/单价/税率/金额。 */
    @Transactional(rollbackFor = Exception.class)
    public Long addLine(Long headerId, ErpSalesOrderLineSaveRequest request) {
        ErpSalesOrder header = require(headerId);
        validateLine(request);
        Integer maxLineNo = lineMapper.selectMaxLineNo(headerId);
        BigDecimal orderQty = request.getOrderQty() != null ? request.getOrderQty() : BigDecimal.ZERO;

        ErpSalesOrderLine line = new ErpSalesOrderLine();
        line.setOrderId(headerId);
        line.setOrderNo(header.getOrderNo());
        line.setLineNo(request.getLineNo() != null
                ? request.getLineNo()
                : (maxLineNo == null ? 1 : maxLineNo + 1));
        line.setLineStatus(StringUtils.hasText(request.getLineStatus())
                ? request.getLineStatus() : DEFAULT_LINE_STATUS);
        line.setUom(StringUtils.hasText(request.getUom())
                ? request.getUom() : DEFAULT_UOM);
        line.setOrderQty(orderQty);
        line.setDeliveredQty(request.getDeliveredQty() != null
                ? request.getDeliveredQty() : BigDecimal.ZERO);
        line.setRemainingQty(request.getRemainingQty() != null
                ? request.getRemainingQty() : orderQty);
        line.setUnitPrice(request.getUnitPrice() != null
                ? request.getUnitPrice() : BigDecimal.ZERO);
        line.setTaxRate(request.getTaxRate() != null
                ? request.getTaxRate() : BigDecimal.ZERO);
        line.setAmount(request.getAmount() != null
                ? request.getAmount() : BigDecimal.ZERO);
        applyLine(line, request);
        lineMapper.insert(line);
        return line.getId();
    }

    /** 更新订单行：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void updateLine(Long lineId, ErpSalesOrderLineSaveRequest request) {
        ErpSalesOrderLine line = requireLine(lineId);
        validateLine(request);
        if (request.getLineNo() != null) {
            line.setLineNo(request.getLineNo());
        }
        applyLine(line, request);
        lineMapper.updateById(line);
    }

    /** 删除订单行：逻辑删除。 */
    @Transactional(rollbackFor = Exception.class)
    public void deleteLine(Long lineId) {
        requireLine(lineId);
        lineMapper.deleteById(lineId);
    }

    public ErpSalesOrder require(Long id) {
        ErpSalesOrder header = mapper.selectById(id);
        if (header == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "销售订单不存在: " + id);
        }
        return header;
    }

    private ErpSalesOrderLine requireLine(Long lineId) {
        ErpSalesOrderLine line = lineMapper.selectById(lineId);
        if (line == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "销售订单行不存在: " + lineId);
        }
        return line;
    }

    private List<ErpSalesOrderLine> listLines(Long orderId) {
        return lineMapper.selectList(Wrappers.<ErpSalesOrderLine>lambdaQuery()
                .eq(ErpSalesOrderLine::getOrderId, orderId)
                .orderByAsc(ErpSalesOrderLine::getLineNo));
    }

    private void validateLine(ErpSalesOrderLineSaveRequest request) {
        if (!StringUtils.hasText(request.getMaterialCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "物料编码不能为空");
        }
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖订单头字段。 */
    private void applyHeader(ErpSalesOrder header, ErpSalesOrderSaveRequest request) {
        if (StringUtils.hasText(request.getOrderNo())) {
            header.setOrderNo(request.getOrderNo());
        }
        if (StringUtils.hasText(request.getOrderType())) {
            header.setOrderType(request.getOrderType());
        }
        if (StringUtils.hasText(request.getCustomerCode())) {
            header.setCustomerCode(request.getCustomerCode());
        }
        if (StringUtils.hasText(request.getCustomerName())) {
            header.setCustomerName(request.getCustomerName());
        }
        if (StringUtils.hasText(request.getSalesRegion())) {
            header.setSalesRegion(request.getSalesRegion());
        }
        if (StringUtils.hasText(request.getSalesperson())) {
            header.setSalesperson(request.getSalesperson());
        }
        if (StringUtils.hasText(request.getProjectCode())) {
            header.setProjectCode(request.getProjectCode());
        }
        if (request.getOrderDate() != null) {
            header.setOrderDate(request.getOrderDate());
        }
        if (request.getDeliveryDate() != null) {
            header.setDeliveryDate(request.getDeliveryDate());
        }
        if (StringUtils.hasText(request.getCurrencyCode())) {
            header.setCurrencyCode(request.getCurrencyCode());
        }
        if (request.getExchangeRate() != null) {
            header.setExchangeRate(request.getExchangeRate());
        }
        if (StringUtils.hasText(request.getTaxCode())) {
            header.setTaxCode(request.getTaxCode());
        }
        if (StringUtils.hasText(request.getPaymentTerm())) {
            header.setPaymentTerm(request.getPaymentTerm());
        }
        if (StringUtils.hasText(request.getSettleMethod())) {
            header.setSettleMethod(request.getSettleMethod());
        }
        if (StringUtils.hasText(request.getCreditStatus())) {
            header.setCreditStatus(request.getCreditStatus());
        }
        if (StringUtils.hasText(request.getReviewStatus())) {
            header.setReviewStatus(request.getReviewStatus());
        }
        if (StringUtils.hasText(request.getOrderStatus())) {
            header.setOrderStatus(request.getOrderStatus());
        }
        if (request.getTotalAmount() != null) {
            header.setTotalAmount(request.getTotalAmount());
        }
        if (request.getTaxAmount() != null) {
            header.setTaxAmount(request.getTaxAmount());
        }
        if (request.getNetAmount() != null) {
            header.setNetAmount(request.getNetAmount());
        }
        if (request.getDeliveredAmount() != null) {
            header.setDeliveredAmount(request.getDeliveredAmount());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            header.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getDescription())) {
            header.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getRemark())) {
            header.setRemark(request.getRemark());
        }
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖订单行字段。 */
    private void applyLine(ErpSalesOrderLine line, ErpSalesOrderLineSaveRequest request) {
        if (StringUtils.hasText(request.getLineStatus())) {
            line.setLineStatus(request.getLineStatus());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            line.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            line.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getSpec())) {
            line.setSpec(request.getSpec());
        }
        if (StringUtils.hasText(request.getUom())) {
            line.setUom(request.getUom());
        }
        if (request.getOrderQty() != null) {
            line.setOrderQty(request.getOrderQty());
        }
        if (request.getDeliveredQty() != null) {
            line.setDeliveredQty(request.getDeliveredQty());
        }
        if (request.getRemainingQty() != null) {
            line.setRemainingQty(request.getRemainingQty());
        }
        if (request.getUnitPrice() != null) {
            line.setUnitPrice(request.getUnitPrice());
        }
        if (request.getTaxRate() != null) {
            line.setTaxRate(request.getTaxRate());
        }
        if (request.getAmount() != null) {
            line.setAmount(request.getAmount());
        }
        if (request.getDeliveryDate() != null) {
            line.setDeliveryDate(request.getDeliveryDate());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            line.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getRemark())) {
            line.setRemark(request.getRemark());
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
