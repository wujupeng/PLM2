package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpOutsourceInvoiceQuery;
import com.huaweicloud.plm.system.dto.ErpOutsourceInvoiceSaveRequest;
import com.huaweicloud.plm.system.entity.ErpOutsourceInvoice;
import com.huaweicloud.plm.system.mapper.ErpOutsourceInvoiceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 委外管理—委外发票（对应 WBS T094 委外加工闭环，属 G3 ERP）：
 * 委外发票登记、分页查询与删除。
 * 发票号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpOutsourceInvoiceService {

    private static final String DEFAULT_INVOICE_NO_PREFIX = "OSV";
    private static final String DEFAULT_INVOICE_TYPE = "SPECIAL";
    private static final String DEFAULT_INVOICE_STATUS = "DRAFT";

    private final ErpOutsourceInvoiceMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询委外发票：状态/类型/订单号/供应商编码精确，发票号/供应商名称模糊，按主键倒序。 */
    public PageResult<ErpOutsourceInvoice> page(ErpOutsourceInvoiceQuery query) {
        Page<ErpOutsourceInvoice> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpOutsourceInvoice>lambdaQuery()
                .eq(StringUtils.hasText(query.getInvoiceStatus()),
                        ErpOutsourceInvoice::getInvoiceStatus, query.getInvoiceStatus())
                .eq(StringUtils.hasText(query.getInvoiceType()),
                        ErpOutsourceInvoice::getInvoiceType, query.getInvoiceType())
                .eq(StringUtils.hasText(query.getOrderNo()),
                        ErpOutsourceInvoice::getOrderNo, query.getOrderNo())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        ErpOutsourceInvoice::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpOutsourceInvoice::getInvoiceNo, query.getKeyword()).or()
                        .like(ErpOutsourceInvoice::getSupplierName, query.getKeyword()))
                .orderByDesc(ErpOutsourceInvoice::getId));
        return PageResult.of(page);
    }

    public ErpOutsourceInvoice detail(Long id) {
        return require(id);
    }

    /** 新增或更新委外发票：新增时回填默认类型/状态/金额与组织，发票号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpOutsourceInvoiceSaveRequest request) {
        ErpOutsourceInvoice entity;
        if (id == null) {
            entity = new ErpOutsourceInvoice();
            entity.setInvoiceNo(StringUtils.hasText(request.getInvoiceNo())
                    ? request.getInvoiceNo() : flowSupport.nextBizNo(DEFAULT_INVOICE_NO_PREFIX));
            entity.setInvoiceType(StringUtils.hasText(request.getInvoiceType())
                    ? request.getInvoiceType() : DEFAULT_INVOICE_TYPE);
            entity.setInvoiceStatus(StringUtils.hasText(request.getInvoiceStatus())
                    ? request.getInvoiceStatus() : DEFAULT_INVOICE_STATUS);
            entity.setInvoiceAmount(request.getInvoiceAmount() != null
                    ? request.getInvoiceAmount() : BigDecimal.ZERO);
            entity.setTaxRate(request.getTaxRate() != null
                    ? request.getTaxRate() : BigDecimal.ZERO);
            entity.setTaxAmount(request.getTaxAmount() != null
                    ? request.getTaxAmount() : BigDecimal.ZERO);
            entity.setNetAmount(request.getNetAmount() != null
                    ? request.getNetAmount() : BigDecimal.ZERO);
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

    /** 删除委外发票：物理删除以释放发票号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpOutsourceInvoice require(Long id) {
        ErpOutsourceInvoice entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "委外发票不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpOutsourceInvoice entity, ErpOutsourceInvoiceSaveRequest request) {
        if (StringUtils.hasText(request.getInvoiceNo())) {
            entity.setInvoiceNo(request.getInvoiceNo());
        }
        if (StringUtils.hasText(request.getInvoiceType())) {
            entity.setInvoiceType(request.getInvoiceType());
        }
        if (StringUtils.hasText(request.getInvoiceCode())) {
            entity.setInvoiceCode(request.getInvoiceCode());
        }
        if (StringUtils.hasText(request.getOrderNo())) {
            entity.setOrderNo(request.getOrderNo());
        }
        if (StringUtils.hasText(request.getReceiptNo())) {
            entity.setReceiptNo(request.getReceiptNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (request.getInvoiceDate() != null) {
            entity.setInvoiceDate(request.getInvoiceDate());
        }
        if (request.getInvoiceAmount() != null) {
            entity.setInvoiceAmount(request.getInvoiceAmount());
        }
        if (request.getTaxRate() != null) {
            entity.setTaxRate(request.getTaxRate());
        }
        if (request.getTaxAmount() != null) {
            entity.setTaxAmount(request.getTaxAmount());
        }
        if (request.getNetAmount() != null) {
            entity.setNetAmount(request.getNetAmount());
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
