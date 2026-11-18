package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpPurchaseSettlementQuery;
import com.huaweicloud.plm.system.dto.ErpPurchaseSettlementSaveRequest;
import com.huaweicloud.plm.system.entity.ErpPurchaseSettlement;
import com.huaweicloud.plm.system.mapper.ErpPurchaseSettlementMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 采购管理—采购结算（G3-N3a ERP 采购管理）：
 * 采购结算单登记、分页查询与删除。
 * 结算单编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpPurchaseSettlementService {

    private static final String DEFAULT_SETTLEMENT_NO_PREFIX = "PST";
    private static final String DEFAULT_PAYMENT_TERM = "NET30";
    private static final String DEFAULT_SETTLEMENT_STATUS = "OPEN";

    private final ErpPurchaseSettlementMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询采购结算单：状态/订单号/供应商编码/发票编号精确，编号/订单号/供应商名称/发票编号模糊，按主键倒序。 */
    public PageResult<ErpPurchaseSettlement> page(ErpPurchaseSettlementQuery query) {
        Page<ErpPurchaseSettlement> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpPurchaseSettlement>lambdaQuery()
                .eq(StringUtils.hasText(query.getSettlementStatus()),
                        ErpPurchaseSettlement::getSettlementStatus, query.getSettlementStatus())
                .eq(StringUtils.hasText(query.getOrderNo()),
                        ErpPurchaseSettlement::getOrderNo, query.getOrderNo())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        ErpPurchaseSettlement::getSupplierCode, query.getSupplierCode())
                .eq(StringUtils.hasText(query.getInvoiceNo()),
                        ErpPurchaseSettlement::getInvoiceNo, query.getInvoiceNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpPurchaseSettlement::getSettlementNo, query.getKeyword()).or()
                        .like(ErpPurchaseSettlement::getOrderNo, query.getKeyword()).or()
                        .like(ErpPurchaseSettlement::getSupplierName, query.getKeyword()).or()
                        .like(ErpPurchaseSettlement::getInvoiceNo, query.getKeyword()))
                .orderByDesc(ErpPurchaseSettlement::getId));
        return PageResult.of(page);
    }

    public ErpPurchaseSettlement detail(Long id) {
        return require(id);
    }

    /** 新增或更新采购结算单：新增时回填默认结算金额/已付金额/余额/账期/状态与组织，编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpPurchaseSettlementSaveRequest request) {
        ErpPurchaseSettlement entity;
        if (id == null) {
            entity = new ErpPurchaseSettlement();
            entity.setSettlementNo(StringUtils.hasText(request.getSettlementNo())
                    ? request.getSettlementNo() : flowSupport.nextBizNo(DEFAULT_SETTLEMENT_NO_PREFIX));
            entity.setSettlementAmount(request.getSettlementAmount() != null
                    ? request.getSettlementAmount() : BigDecimal.ZERO);
            entity.setPaidAmount(request.getPaidAmount() != null
                    ? request.getPaidAmount() : BigDecimal.ZERO);
            entity.setSettleBalance(request.getSettleBalance() != null
                    ? request.getSettleBalance() : BigDecimal.ZERO);
            entity.setPaymentTerm(StringUtils.hasText(request.getPaymentTerm())
                    ? request.getPaymentTerm() : DEFAULT_PAYMENT_TERM);
            entity.setSettlementStatus(StringUtils.hasText(request.getSettlementStatus())
                    ? request.getSettlementStatus() : DEFAULT_SETTLEMENT_STATUS);
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

    /** 删除采购结算单：物理删除以释放结算单编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpPurchaseSettlement require(Long id) {
        ErpPurchaseSettlement entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "采购结算单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpPurchaseSettlement entity, ErpPurchaseSettlementSaveRequest request) {
        if (StringUtils.hasText(request.getSettlementNo())) {
            entity.setSettlementNo(request.getSettlementNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (StringUtils.hasText(request.getOrderNo())) {
            entity.setOrderNo(request.getOrderNo());
        }
        if (StringUtils.hasText(request.getInvoiceNo())) {
            entity.setInvoiceNo(request.getInvoiceNo());
        }
        if (request.getSettlementDate() != null) {
            entity.setSettlementDate(request.getSettlementDate());
        }
        if (request.getSettlementAmount() != null) {
            entity.setSettlementAmount(request.getSettlementAmount());
        }
        if (request.getPaidAmount() != null) {
            entity.setPaidAmount(request.getPaidAmount());
        }
        if (request.getSettleBalance() != null) {
            entity.setSettleBalance(request.getSettleBalance());
        }
        if (StringUtils.hasText(request.getPaymentTerm())) {
            entity.setPaymentTerm(request.getPaymentTerm());
        }
        if (StringUtils.hasText(request.getSettlementStatus())) {
            entity.setSettlementStatus(request.getSettlementStatus());
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
