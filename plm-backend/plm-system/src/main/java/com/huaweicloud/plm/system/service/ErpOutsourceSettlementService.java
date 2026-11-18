package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpOutsourceSettlementQuery;
import com.huaweicloud.plm.system.dto.ErpOutsourceSettlementSaveRequest;
import com.huaweicloud.plm.system.entity.ErpOutsourceSettlement;
import com.huaweicloud.plm.system.mapper.ErpOutsourceSettlementMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 委外管理—委外结算单（对应 WBS T024 委外管理，属 G3 ERP）：
 * 委外结算登记、分页查询与删除。
 * 结算单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpOutsourceSettlementService {

    private static final String DEFAULT_SETTLEMENT_NO_PREFIX = "OSS";
    private static final String DEFAULT_PAYMENT_TERM = "NET30";
    private static final String DEFAULT_SETTLEMENT_STATUS = "OPEN";

    private final ErpOutsourceSettlementMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询委外结算单：状态/订单号/供应商编码/发票号精确，结算单号/供应商名称模糊，按主键倒序。 */
    public PageResult<ErpOutsourceSettlement> page(ErpOutsourceSettlementQuery query) {
        Page<ErpOutsourceSettlement> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpOutsourceSettlement>lambdaQuery()
                .eq(StringUtils.hasText(query.getSettlementStatus()),
                        ErpOutsourceSettlement::getSettlementStatus, query.getSettlementStatus())
                .eq(StringUtils.hasText(query.getOrderNo()),
                        ErpOutsourceSettlement::getOrderNo, query.getOrderNo())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        ErpOutsourceSettlement::getSupplierCode, query.getSupplierCode())
                .eq(StringUtils.hasText(query.getInvoiceNo()),
                        ErpOutsourceSettlement::getInvoiceNo, query.getInvoiceNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpOutsourceSettlement::getSettlementNo, query.getKeyword()).or()
                        .like(ErpOutsourceSettlement::getSupplierName, query.getKeyword()))
                .orderByDesc(ErpOutsourceSettlement::getId));
        return PageResult.of(page);
    }

    public ErpOutsourceSettlement detail(Long id) {
        return require(id);
    }

    /** 新增或更新委外结算单：新增时回填默认账期/状态/金额与组织，结算单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpOutsourceSettlementSaveRequest request) {
        ErpOutsourceSettlement entity;
        if (id == null) {
            entity = new ErpOutsourceSettlement();
            entity.setSettlementNo(StringUtils.hasText(request.getSettlementNo())
                    ? request.getSettlementNo() : flowSupport.nextBizNo(DEFAULT_SETTLEMENT_NO_PREFIX));
            entity.setPaymentTerm(StringUtils.hasText(request.getPaymentTerm())
                    ? request.getPaymentTerm() : DEFAULT_PAYMENT_TERM);
            entity.setSettlementStatus(StringUtils.hasText(request.getSettlementStatus())
                    ? request.getSettlementStatus() : DEFAULT_SETTLEMENT_STATUS);
            entity.setSettlementAmount(request.getSettlementAmount() != null
                    ? request.getSettlementAmount() : BigDecimal.ZERO);
            entity.setPaidAmount(request.getPaidAmount() != null
                    ? request.getPaidAmount() : BigDecimal.ZERO);
            entity.setSettleBalance(request.getSettleBalance() != null
                    ? request.getSettleBalance() : BigDecimal.ZERO);
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

    /** 删除委外结算单：物理删除以释放结算单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpOutsourceSettlement require(Long id) {
        ErpOutsourceSettlement entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "委外结算单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpOutsourceSettlement entity, ErpOutsourceSettlementSaveRequest request) {
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
