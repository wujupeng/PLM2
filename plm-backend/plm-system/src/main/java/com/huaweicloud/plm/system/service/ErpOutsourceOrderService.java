package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpOutsourceOrderDetailResponse;
import com.huaweicloud.plm.system.dto.ErpOutsourceOrderLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpOutsourceOrderQuery;
import com.huaweicloud.plm.system.dto.ErpOutsourceOrderSaveRequest;
import com.huaweicloud.plm.system.entity.ErpOutsourceOrder;
import com.huaweicloud.plm.system.entity.ErpOutsourceOrderLine;
import com.huaweicloud.plm.system.mapper.ErpOutsourceOrderLineMapper;
import com.huaweicloud.plm.system.mapper.ErpOutsourceOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

/**
 * ERP 委外管理—委外订单（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）：
 * 委外订单头与明细行的登记、分页查询、明细维护与删除。
 * 删除时先逻辑删除全部明细行，再物理删除委外订单头以释放委外订单号。
 */
@Service
@RequiredArgsConstructor
public class ErpOutsourceOrderService {

    private static final String DEFAULT_ORDER_NO_PREFIX = "OSO";
    private static final String DEFAULT_ORDER_TYPE = "STANDARD";
    private static final String DEFAULT_CURRENCY_CODE = "CNY";
    private static final String DEFAULT_PAYMENT_TERM = "NET30";
    private static final String DEFAULT_SETTLE_METHOD = "TRANSFER";
    private static final String DEFAULT_REVIEW_STATUS = "PENDING";
    private static final String DEFAULT_ORDER_STATUS = "DRAFT";
    private static final String DEFAULT_LINE_STATUS = "OPEN";
    private static final String DEFAULT_UOM = "PCS";

    private final ErpOutsourceOrderMapper mapper;
    private final ErpOutsourceOrderLineMapper lineMapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询委外订单：状态/审核状态/类型/加工商精确，单号/加工商名称模糊，按主键倒序。 */
    public PageResult<ErpOutsourceOrder> page(ErpOutsourceOrderQuery query) {
        Page<ErpOutsourceOrder> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpOutsourceOrder>lambdaQuery()
                .eq(StringUtils.hasText(query.getOrderStatus()),
                        ErpOutsourceOrder::getOrderStatus, query.getOrderStatus())
                .eq(StringUtils.hasText(query.getReviewStatus()),
                        ErpOutsourceOrder::getReviewStatus, query.getReviewStatus())
                .eq(StringUtils.hasText(query.getOrderType()),
                        ErpOutsourceOrder::getOrderType, query.getOrderType())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        ErpOutsourceOrder::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpOutsourceOrder::getOrderNo, query.getKeyword()).or()
                        .like(ErpOutsourceOrder::getSupplierName, query.getKeyword()))
                .orderByDesc(ErpOutsourceOrder::getId));
        return PageResult.of(page);
    }

    /** 委外订单详情：返回委外订单头与全部明细行。 */
    public ErpOutsourceOrderDetailResponse detail(Long id) {
        ErpOutsourceOrder header = require(id);
        ErpOutsourceOrderDetailResponse response = new ErpOutsourceOrderDetailResponse();
        response.setHeader(header);
        response.setLines(listLines(id));
        return response;
    }

    /** 新增委外订单：回填默认类型/币别/汇率/付款条件/结算方式/审核状态/订单状态/金额与组织，委外订单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long create(ErpOutsourceOrderSaveRequest request) {
        ErpOutsourceOrder header = new ErpOutsourceOrder();
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
        header.setReceivedAmount(request.getReceivedAmount() != null
                ? request.getReceivedAmount() : BigDecimal.ZERO);
        header.setOrgId(currentOrgId());
        applyHeader(header, request);
        mapper.insert(header);
        return header.getId();
    }

    /** 更新委外订单头：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, ErpOutsourceOrderSaveRequest request) {
        ErpOutsourceOrder header = require(id);
        applyHeader(header, request);
        mapper.updateById(header);
    }

    /** 删除委外订单：先逻辑删除全部明细行，再物理删除委外订单头以释放委外订单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        lineMapper.delete(Wrappers.<ErpOutsourceOrderLine>lambdaQuery()
                .eq(ErpOutsourceOrderLine::getOrderId, id));
        mapper.physicalDeleteById(id);
    }

    /** 新增委外订单行：行号为空时取当前最大行号 +1，回填默认行状态/单位/数量。 */
    @Transactional(rollbackFor = Exception.class)
    public Long addLine(Long headerId, ErpOutsourceOrderLineSaveRequest request) {
        ErpOutsourceOrder header = require(headerId);
        validateLine(request);
        Integer maxLineNo = lineMapper.selectMaxLineNo(headerId);

        ErpOutsourceOrderLine line = new ErpOutsourceOrderLine();
        line.setOrderId(headerId);
        line.setOrderNo(header.getOrderNo());
        line.setLineNo(request.getLineNo() != null
                ? request.getLineNo()
                : (maxLineNo == null ? 1 : maxLineNo + 1));
        line.setLineStatus(StringUtils.hasText(request.getLineStatus())
                ? request.getLineStatus() : DEFAULT_LINE_STATUS);
        line.setUom(StringUtils.hasText(request.getUom())
                ? request.getUom() : DEFAULT_UOM);
        line.setOrderQty(request.getOrderQty() != null
                ? request.getOrderQty() : BigDecimal.ZERO);
        line.setIssuedQty(request.getIssuedQty() != null
                ? request.getIssuedQty() : BigDecimal.ZERO);
        line.setReceivedQty(request.getReceivedQty() != null
                ? request.getReceivedQty() : BigDecimal.ZERO);
        line.setRemainingQty(request.getRemainingQty() != null
                ? request.getRemainingQty() : BigDecimal.ZERO);
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

    /** 更新委外订单行：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void updateLine(Long lineId, ErpOutsourceOrderLineSaveRequest request) {
        ErpOutsourceOrderLine line = requireLine(lineId);
        validateLine(request);
        if (request.getLineNo() != null) {
            line.setLineNo(request.getLineNo());
        }
        applyLine(line, request);
        lineMapper.updateById(line);
    }

    /** 删除委外订单行：逻辑删除。 */
    @Transactional(rollbackFor = Exception.class)
    public void deleteLine(Long lineId) {
        requireLine(lineId);
        lineMapper.deleteById(lineId);
    }

    public ErpOutsourceOrder require(Long id) {
        ErpOutsourceOrder header = mapper.selectById(id);
        if (header == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "委外订单不存在: " + id);
        }
        return header;
    }

    private ErpOutsourceOrderLine requireLine(Long lineId) {
        ErpOutsourceOrderLine line = lineMapper.selectById(lineId);
        if (line == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "委外订单行不存在: " + lineId);
        }
        return line;
    }

    private List<ErpOutsourceOrderLine> listLines(Long orderId) {
        return lineMapper.selectList(Wrappers.<ErpOutsourceOrderLine>lambdaQuery()
                .eq(ErpOutsourceOrderLine::getOrderId, orderId)
                .orderByAsc(ErpOutsourceOrderLine::getLineNo));
    }

    private void validateLine(ErpOutsourceOrderLineSaveRequest request) {
        if (!StringUtils.hasText(request.getMaterialCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "物料编码不能为空");
        }
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖委外订单头字段。 */
    private void applyHeader(ErpOutsourceOrder header, ErpOutsourceOrderSaveRequest request) {
        if (StringUtils.hasText(request.getOrderNo())) {
            header.setOrderNo(request.getOrderNo());
        }
        if (StringUtils.hasText(request.getOrderType())) {
            header.setOrderType(request.getOrderType());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            header.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            header.setSupplierName(request.getSupplierName());
        }
        if (StringUtils.hasText(request.getBuyerName())) {
            header.setBuyerName(request.getBuyerName());
        }
        if (StringUtils.hasText(request.getPurchaseGroup())) {
            header.setPurchaseGroup(request.getPurchaseGroup());
        }
        if (request.getOrderDate() != null) {
            header.setOrderDate(request.getOrderDate());
        }
        if (request.getRequiredDate() != null) {
            header.setRequiredDate(request.getRequiredDate());
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
        if (request.getReceivedAmount() != null) {
            header.setReceivedAmount(request.getReceivedAmount());
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

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖委外订单行字段。 */
    private void applyLine(ErpOutsourceOrderLine line, ErpOutsourceOrderLineSaveRequest request) {
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
        if (request.getIssuedQty() != null) {
            line.setIssuedQty(request.getIssuedQty());
        }
        if (request.getReceivedQty() != null) {
            line.setReceivedQty(request.getReceivedQty());
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
        if (request.getRequiredDate() != null) {
            line.setRequiredDate(request.getRequiredDate());
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
