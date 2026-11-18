package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpPurchaseInquiryQuery;
import com.huaweicloud.plm.system.dto.ErpPurchaseInquirySaveRequest;
import com.huaweicloud.plm.system.entity.ErpPurchaseInquiry;
import com.huaweicloud.plm.system.mapper.ErpPurchaseInquiryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 采购管理—采购询价单（对应 WBS T023 采购管理，属 G3 ERP）：
 * 采购询价登记、分页查询与删除。
 * 询价单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpPurchaseInquiryService {

    private static final String DEFAULT_INQUIRY_NO_PREFIX = "PIQ";
    private static final String DEFAULT_UOM = "PCS";
    private static final String DEFAULT_CURRENCY_CODE = "CNY";
    private static final String DEFAULT_INQUIRY_STATUS = "DRAFT";

    private final ErpPurchaseInquiryMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询采购询价单：状态/物料编码/供应商编码精确，单号/物料编码/供应商名称模糊，按主键倒序。 */
    public PageResult<ErpPurchaseInquiry> page(ErpPurchaseInquiryQuery query) {
        Page<ErpPurchaseInquiry> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpPurchaseInquiry>lambdaQuery()
                .eq(StringUtils.hasText(query.getInquiryStatus()),
                        ErpPurchaseInquiry::getInquiryStatus, query.getInquiryStatus())
                .eq(StringUtils.hasText(query.getMaterialCode()),
                        ErpPurchaseInquiry::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        ErpPurchaseInquiry::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpPurchaseInquiry::getInquiryNo, query.getKeyword()).or()
                        .like(ErpPurchaseInquiry::getMaterialCode, query.getKeyword()).or()
                        .like(ErpPurchaseInquiry::getSupplierName, query.getKeyword()))
                .orderByDesc(ErpPurchaseInquiry::getId));
        return PageResult.of(page);
    }

    public ErpPurchaseInquiry detail(Long id) {
        return require(id);
    }

    /** 新增或更新采购询价单：新增时回填默认单位/币别/状态/数量与组织，询价单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpPurchaseInquirySaveRequest request) {
        ErpPurchaseInquiry entity;
        if (id == null) {
            entity = new ErpPurchaseInquiry();
            entity.setInquiryNo(StringUtils.hasText(request.getInquiryNo())
                    ? request.getInquiryNo() : flowSupport.nextBizNo(DEFAULT_INQUIRY_NO_PREFIX));
            entity.setUom(StringUtils.hasText(request.getUom())
                    ? request.getUom() : DEFAULT_UOM);
            entity.setCurrencyCode(StringUtils.hasText(request.getCurrencyCode())
                    ? request.getCurrencyCode() : DEFAULT_CURRENCY_CODE);
            entity.setInquiryStatus(StringUtils.hasText(request.getInquiryStatus())
                    ? request.getInquiryStatus() : DEFAULT_INQUIRY_STATUS);
            entity.setInquiryQty(request.getInquiryQty() != null
                    ? request.getInquiryQty() : BigDecimal.ZERO);
            entity.setQuotePrice(request.getQuotePrice() != null
                    ? request.getQuotePrice() : BigDecimal.ZERO);
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

    /** 删除采购询价单：物理删除以释放询价单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpPurchaseInquiry require(Long id) {
        ErpPurchaseInquiry entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "采购询价单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpPurchaseInquiry entity, ErpPurchaseInquirySaveRequest request) {
        if (StringUtils.hasText(request.getInquiryNo())) {
            entity.setInquiryNo(request.getInquiryNo());
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
        if (StringUtils.hasText(request.getUom())) {
            entity.setUom(request.getUom());
        }
        if (request.getInquiryQty() != null) {
            entity.setInquiryQty(request.getInquiryQty());
        }
        if (request.getInquiryDate() != null) {
            entity.setInquiryDate(request.getInquiryDate());
        }
        if (request.getQuoteDeadline() != null) {
            entity.setQuoteDeadline(request.getQuoteDeadline());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (request.getQuotePrice() != null) {
            entity.setQuotePrice(request.getQuotePrice());
        }
        if (StringUtils.hasText(request.getCurrencyCode())) {
            entity.setCurrencyCode(request.getCurrencyCode());
        }
        if (request.getQuoteDate() != null) {
            entity.setQuoteDate(request.getQuoteDate());
        }
        if (request.getValidUntil() != null) {
            entity.setValidUntil(request.getValidUntil());
        }
        if (StringUtils.hasText(request.getInquiryStatus())) {
            entity.setInquiryStatus(request.getInquiryStatus());
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
