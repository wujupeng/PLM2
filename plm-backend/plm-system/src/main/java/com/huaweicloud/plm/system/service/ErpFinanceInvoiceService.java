package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpFinanceInvoiceQuery;
import com.huaweicloud.plm.system.dto.ErpFinanceInvoiceSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinanceInvoice;
import com.huaweicloud.plm.system.mapper.ErpFinanceInvoiceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 财务—发票登记（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）：
 * 发票登记、分页查询与删除。
 * 发票号码由用户提供、是唯一业务键，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpFinanceInvoiceService {

    private static final String DEFAULT_INVOICE_TYPE = "VAT_SPECIAL";
    private static final String DEFAULT_DIRECTION = "OUT";
    private static final String DEFAULT_PARTY_TYPE = "CUSTOMER";
    private static final String DEFAULT_CURRENCY_CODE = "CNY";
    private static final String DEFAULT_VERIFY_STATUS = "UNVERIFIED";
    private static final String DEFAULT_INVOICE_STATUS = "DRAFT";

    private final ErpFinanceInvoiceMapper mapper;

    /** 分页查询发票登记：类型/方向/发票状态/查验状态精确，发票号码/发票代码/往来单位名称模糊，按主键倒序。 */
    public PageResult<ErpFinanceInvoice> page(ErpFinanceInvoiceQuery query) {
        Page<ErpFinanceInvoice> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpFinanceInvoice>lambdaQuery()
                .eq(StringUtils.hasText(query.getInvoiceType()),
                        ErpFinanceInvoice::getInvoiceType, query.getInvoiceType())
                .eq(StringUtils.hasText(query.getDirection()),
                        ErpFinanceInvoice::getDirection, query.getDirection())
                .eq(StringUtils.hasText(query.getInvoiceStatus()),
                        ErpFinanceInvoice::getInvoiceStatus, query.getInvoiceStatus())
                .eq(StringUtils.hasText(query.getVerifyStatus()),
                        ErpFinanceInvoice::getVerifyStatus, query.getVerifyStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpFinanceInvoice::getInvoiceNo, query.getKeyword()).or()
                        .like(ErpFinanceInvoice::getInvoiceCode, query.getKeyword()).or()
                        .like(ErpFinanceInvoice::getPartyName, query.getKeyword()))
                .orderByDesc(ErpFinanceInvoice::getId));
        return PageResult.of(page);
    }

    public ErpFinanceInvoice detail(Long id) {
        return require(id);
    }

    /** 新增或更新发票登记：新增时回填默认类型/方向/往来单位类型/金额税额/币种/查验与发票状态及组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpFinanceInvoiceSaveRequest request) {
        ErpFinanceInvoice entity;
        if (id == null) {
            entity = new ErpFinanceInvoice();
            entity.setInvoiceNo(request.getInvoiceNo());
            entity.setInvoiceType(StringUtils.hasText(request.getInvoiceType())
                    ? request.getInvoiceType() : DEFAULT_INVOICE_TYPE);
            entity.setDirection(StringUtils.hasText(request.getDirection())
                    ? request.getDirection() : DEFAULT_DIRECTION);
            entity.setPartyType(StringUtils.hasText(request.getPartyType())
                    ? request.getPartyType() : DEFAULT_PARTY_TYPE);
            entity.setAmount(request.getAmount() != null
                    ? request.getAmount() : BigDecimal.ZERO);
            entity.setTaxRate(request.getTaxRate() != null
                    ? request.getTaxRate() : BigDecimal.ZERO);
            entity.setTaxAmount(request.getTaxAmount() != null
                    ? request.getTaxAmount() : BigDecimal.ZERO);
            entity.setTotalAmount(request.getTotalAmount() != null
                    ? request.getTotalAmount() : BigDecimal.ZERO);
            entity.setCurrencyCode(StringUtils.hasText(request.getCurrencyCode())
                    ? request.getCurrencyCode() : DEFAULT_CURRENCY_CODE);
            entity.setVerifyStatus(StringUtils.hasText(request.getVerifyStatus())
                    ? request.getVerifyStatus() : DEFAULT_VERIFY_STATUS);
            entity.setInvoiceStatus(StringUtils.hasText(request.getInvoiceStatus())
                    ? request.getInvoiceStatus() : DEFAULT_INVOICE_STATUS);
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

    /** 删除发票登记：物理删除以释放发票号码。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpFinanceInvoice require(Long id) {
        ErpFinanceInvoice entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "发票登记不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpFinanceInvoice entity, ErpFinanceInvoiceSaveRequest request) {
        if (StringUtils.hasText(request.getInvoiceNo())) {
            entity.setInvoiceNo(request.getInvoiceNo());
        }
        if (StringUtils.hasText(request.getInvoiceCode())) {
            entity.setInvoiceCode(request.getInvoiceCode());
        }
        if (StringUtils.hasText(request.getInvoiceType())) {
            entity.setInvoiceType(request.getInvoiceType());
        }
        if (StringUtils.hasText(request.getDirection())) {
            entity.setDirection(request.getDirection());
        }
        if (StringUtils.hasText(request.getPartyType())) {
            entity.setPartyType(request.getPartyType());
        }
        if (StringUtils.hasText(request.getPartyCode())) {
            entity.setPartyCode(request.getPartyCode());
        }
        if (StringUtils.hasText(request.getPartyName())) {
            entity.setPartyName(request.getPartyName());
        }
        if (StringUtils.hasText(request.getSourceNo())) {
            entity.setSourceNo(request.getSourceNo());
        }
        if (request.getAmount() != null) {
            entity.setAmount(request.getAmount());
        }
        if (request.getTaxRate() != null) {
            entity.setTaxRate(request.getTaxRate());
        }
        if (request.getTaxAmount() != null) {
            entity.setTaxAmount(request.getTaxAmount());
        }
        if (request.getTotalAmount() != null) {
            entity.setTotalAmount(request.getTotalAmount());
        }
        if (StringUtils.hasText(request.getCurrencyCode())) {
            entity.setCurrencyCode(request.getCurrencyCode());
        }
        if (request.getInvoiceDate() != null) {
            entity.setInvoiceDate(request.getInvoiceDate());
        }
        if (StringUtils.hasText(request.getVerifyStatus())) {
            entity.setVerifyStatus(request.getVerifyStatus());
        }
        if (StringUtils.hasText(request.getInvoiceStatus())) {
            entity.setInvoiceStatus(request.getInvoiceStatus());
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
