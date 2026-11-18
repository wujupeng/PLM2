package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmSupplierQuoteQuery;
import com.huaweicloud.plm.system.dto.SrmSupplierQuoteSaveRequest;
import com.huaweicloud.plm.system.entity.SrmSupplierQuote;
import com.huaweicloud.plm.system.mapper.SrmSupplierQuoteMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 寻源与询报价—供应商报价（对应供应商报价）：
 * 报价记录登记、分页查询与删除。
 * 报价单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmSupplierQuoteService {

    private static final String DEFAULT_QUOTE_NO_PREFIX = "QTE";
    private static final String DEFAULT_CURRENCY = "CNY";
    private static final String DEFAULT_QUOTE_STATUS = "DRAFT";

    private final SrmSupplierQuoteMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询报价记录：报价状态/询价单号/供应商编码/物料编码精确，报价单号/询价单号/供应商编码/供应商名称/物料编码模糊，按主键倒序。 */
    public PageResult<SrmSupplierQuote> page(SrmSupplierQuoteQuery query) {
        Page<SrmSupplierQuote> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmSupplierQuote>lambdaQuery()
                .eq(StringUtils.hasText(query.getQuoteStatus()),
                        SrmSupplierQuote::getQuoteStatus, query.getQuoteStatus())
                .eq(StringUtils.hasText(query.getRfqNo()),
                        SrmSupplierQuote::getRfqNo, query.getRfqNo())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmSupplierQuote::getSupplierCode, query.getSupplierCode())
                .eq(StringUtils.hasText(query.getMaterialCode()),
                        SrmSupplierQuote::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmSupplierQuote::getQuoteNo, query.getKeyword()).or()
                        .like(SrmSupplierQuote::getRfqNo, query.getKeyword()).or()
                        .like(SrmSupplierQuote::getSupplierCode, query.getKeyword()).or()
                        .like(SrmSupplierQuote::getSupplierName, query.getKeyword()).or()
                        .like(SrmSupplierQuote::getMaterialCode, query.getKeyword()))
                .orderByDesc(SrmSupplierQuote::getId));
        return PageResult.of(page);
    }

    public SrmSupplierQuote detail(Long id) {
        return require(id);
    }

    /** 新增或更新报价记录：新增时回填默认币种/报价状态与组织，报价单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmSupplierQuoteSaveRequest request) {
        SrmSupplierQuote entity;
        if (id == null) {
            entity = new SrmSupplierQuote();
            entity.setQuoteNo(StringUtils.hasText(request.getQuoteNo())
                    ? request.getQuoteNo() : flowSupport.nextBizNo(DEFAULT_QUOTE_NO_PREFIX));
            entity.setCurrency(StringUtils.hasText(request.getCurrency())
                    ? request.getCurrency() : DEFAULT_CURRENCY);
            entity.setQuoteStatus(StringUtils.hasText(request.getQuoteStatus())
                    ? request.getQuoteStatus() : DEFAULT_QUOTE_STATUS);
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

    /** 删除报价记录：物理删除以释放报价单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmSupplierQuote require(Long id) {
        SrmSupplierQuote entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "供应商报价不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmSupplierQuote entity, SrmSupplierQuoteSaveRequest request) {
        if (StringUtils.hasText(request.getQuoteNo())) {
            entity.setQuoteNo(request.getQuoteNo());
        }
        if (StringUtils.hasText(request.getRfqNo())) {
            entity.setRfqNo(request.getRfqNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
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
        if (request.getQuoteQty() != null) {
            entity.setQuoteQty(request.getQuoteQty());
        }
        if (StringUtils.hasText(request.getUnit())) {
            entity.setUnit(request.getUnit());
        }
        if (request.getUnitPrice() != null) {
            entity.setUnitPrice(request.getUnitPrice());
        }
        if (request.getTaxRate() != null) {
            entity.setTaxRate(request.getTaxRate());
        }
        if (request.getTotalAmount() != null) {
            entity.setTotalAmount(request.getTotalAmount());
        }
        if (StringUtils.hasText(request.getCurrency())) {
            entity.setCurrency(request.getCurrency());
        }
        if (request.getDeliveryDays() != null) {
            entity.setDeliveryDays(request.getDeliveryDays());
        }
        if (StringUtils.hasText(request.getPaymentTerm())) {
            entity.setPaymentTerm(request.getPaymentTerm());
        }
        if (request.getQuoteDate() != null) {
            entity.setQuoteDate(request.getQuoteDate());
        }
        if (request.getValidUntil() != null) {
            entity.setValidUntil(request.getValidUntil());
        }
        if (StringUtils.hasText(request.getQuoteStatus())) {
            entity.setQuoteStatus(request.getQuoteStatus());
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
