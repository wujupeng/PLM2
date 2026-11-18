package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpSalesInvoiceQuery;
import com.huaweicloud.plm.system.dto.ErpSalesInvoiceSaveRequest;
import com.huaweicloud.plm.system.entity.ErpSalesInvoice;
import com.huaweicloud.plm.system.mapper.ErpSalesInvoiceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 销售管理—销售发票（G3-N2 ERP 销售管理）：
 * 销售发票登记、分页查询与删除。
 * 发票单编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpSalesInvoiceService {

    private static final String DEFAULT_INVOICE_NO_PREFIX = "SINV";
    private static final String DEFAULT_INVOICE_TYPE = "SPECIAL";
    private static final String DEFAULT_INVOICE_STATUS = "DRAFT";

    private final ErpSalesInvoiceMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询销售发票：状态/类型/订单号/客户编码精确，编号/订单号/客户名称模糊，按主键倒序。 */
    public PageResult<ErpSalesInvoice> pageInvoices(ErpSalesInvoiceQuery query) {
        Page<ErpSalesInvoice> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpSalesInvoice>lambdaQuery()
                .eq(StringUtils.hasText(query.getInvoiceStatus()),
                        ErpSalesInvoice::getInvoiceStatus, query.getInvoiceStatus())
                .eq(StringUtils.hasText(query.getInvoiceType()),
                        ErpSalesInvoice::getInvoiceType, query.getInvoiceType())
                .eq(StringUtils.hasText(query.getOrderNo()),
                        ErpSalesInvoice::getOrderNo, query.getOrderNo())
                .eq(StringUtils.hasText(query.getCustomerCode()),
                        ErpSalesInvoice::getCustomerCode, query.getCustomerCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpSalesInvoice::getInvoiceNo, query.getKeyword()).or()
                        .like(ErpSalesInvoice::getOrderNo, query.getKeyword()).or()
                        .like(ErpSalesInvoice::getCustomerName, query.getKeyword()))
                .orderByDesc(ErpSalesInvoice::getId));
        return PageResult.of(page);
    }

    public ErpSalesInvoice detail(Long id) {
        return require(id);
    }

    /** 新增或更新销售发票：新增时回填默认类型/金额/税率/税额/不含税金额/状态与组织，编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpSalesInvoiceSaveRequest request) {
        ErpSalesInvoice entity;
        if (id == null) {
            entity = new ErpSalesInvoice();
            entity.setInvoiceNo(StringUtils.hasText(request.getInvoiceNo())
                    ? request.getInvoiceNo() : flowSupport.nextBizNo(DEFAULT_INVOICE_NO_PREFIX));
            entity.setInvoiceType(StringUtils.hasText(request.getInvoiceType())
                    ? request.getInvoiceType() : DEFAULT_INVOICE_TYPE);
            entity.setInvoiceAmount(request.getInvoiceAmount() != null
                    ? request.getInvoiceAmount() : BigDecimal.ZERO);
            entity.setTaxRate(request.getTaxRate() != null
                    ? request.getTaxRate() : BigDecimal.ZERO);
            entity.setTaxAmount(request.getTaxAmount() != null
                    ? request.getTaxAmount() : BigDecimal.ZERO);
            entity.setNetAmount(request.getNetAmount() != null
                    ? request.getNetAmount() : BigDecimal.ZERO);
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

    /** 删除销售发票：物理删除以释放发票单编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpSalesInvoice require(Long id) {
        ErpSalesInvoice entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "销售发票不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpSalesInvoice entity, ErpSalesInvoiceSaveRequest request) {
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
        if (StringUtils.hasText(request.getDeliveryNo())) {
            entity.setDeliveryNo(request.getDeliveryNo());
        }
        if (StringUtils.hasText(request.getCustomerCode())) {
            entity.setCustomerCode(request.getCustomerCode());
        }
        if (StringUtils.hasText(request.getCustomerName())) {
            entity.setCustomerName(request.getCustomerName());
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
