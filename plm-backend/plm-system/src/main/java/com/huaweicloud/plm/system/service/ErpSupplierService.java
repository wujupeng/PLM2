package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpSupplierQuery;
import com.huaweicloud.plm.system.dto.ErpSupplierSaveRequest;
import com.huaweicloud.plm.system.entity.ErpSupplier;
import com.huaweicloud.plm.system.mapper.ErpSupplierMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * ERP 基础资料—供应商业务档案（G3-N1 ERP 基础资料 WBS T021）：
 * 供应商档案登记、分页查询与删除。
 * 供应商编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpSupplierService {

    private static final String DEFAULT_SUPPLIER_NO_PREFIX = "ESUP";
    private static final String DEFAULT_SUPPLIER_TYPE = "RAW";
    private static final String DEFAULT_SETTLE_METHOD = "TRANSFER";
    private static final String DEFAULT_PAYMENT_TERM = "NET30";
    private static final String DEFAULT_SUPPLIER_STATUS = "ACTIVE";

    private final ErpSupplierMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询供应商档案：类型/状态精确，编号/编码/名称模糊，按主键倒序。 */
    public PageResult<ErpSupplier> pageSuppliers(ErpSupplierQuery query) {
        Page<ErpSupplier> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpSupplier>lambdaQuery()
                .eq(StringUtils.hasText(query.getSupplierType()),
                        ErpSupplier::getSupplierType, query.getSupplierType())
                .eq(StringUtils.hasText(query.getSupplierStatus()),
                        ErpSupplier::getSupplierStatus, query.getSupplierStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpSupplier::getSupplierNo, query.getKeyword()).or()
                        .like(ErpSupplier::getSupplierCode, query.getKeyword()).or()
                        .like(ErpSupplier::getSupplierName, query.getKeyword()))
                .orderByDesc(ErpSupplier::getId));
        return PageResult.of(page);
    }

    public ErpSupplier detail(Long id) {
        return require(id);
    }

    /** 新增或更新供应商档案：新增时回填默认类型/结算方式/付款条件/状态与组织，编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpSupplierSaveRequest request) {
        ErpSupplier entity;
        if (id == null) {
            entity = new ErpSupplier();
            entity.setSupplierNo(StringUtils.hasText(request.getSupplierNo())
                    ? request.getSupplierNo() : flowSupport.nextBizNo(DEFAULT_SUPPLIER_NO_PREFIX));
            entity.setSupplierType(StringUtils.hasText(request.getSupplierType())
                    ? request.getSupplierType() : DEFAULT_SUPPLIER_TYPE);
            entity.setSettleMethod(StringUtils.hasText(request.getSettleMethod())
                    ? request.getSettleMethod() : DEFAULT_SETTLE_METHOD);
            entity.setPaymentTerm(StringUtils.hasText(request.getPaymentTerm())
                    ? request.getPaymentTerm() : DEFAULT_PAYMENT_TERM);
            entity.setSupplierStatus(StringUtils.hasText(request.getSupplierStatus())
                    ? request.getSupplierStatus() : DEFAULT_SUPPLIER_STATUS);
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

    /** 删除供应商档案：物理删除以释放供应商编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpSupplier require(Long id) {
        ErpSupplier entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "供应商业务档案不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpSupplier entity, ErpSupplierSaveRequest request) {
        if (StringUtils.hasText(request.getSupplierNo())) {
            entity.setSupplierNo(request.getSupplierNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (StringUtils.hasText(request.getShortName())) {
            entity.setShortName(request.getShortName());
        }
        if (StringUtils.hasText(request.getSupplierType())) {
            entity.setSupplierType(request.getSupplierType());
        }
        if (StringUtils.hasText(request.getPurchaseGroup())) {
            entity.setPurchaseGroup(request.getPurchaseGroup());
        }
        if (StringUtils.hasText(request.getBuyerName())) {
            entity.setBuyerName(request.getBuyerName());
        }
        if (StringUtils.hasText(request.getSettleMethod())) {
            entity.setSettleMethod(request.getSettleMethod());
        }
        if (StringUtils.hasText(request.getPaymentTerm())) {
            entity.setPaymentTerm(request.getPaymentTerm());
        }
        if (StringUtils.hasText(request.getTaxCode())) {
            entity.setTaxCode(request.getTaxCode());
        }
        if (StringUtils.hasText(request.getContact())) {
            entity.setContact(request.getContact());
        }
        if (StringUtils.hasText(request.getPhone())) {
            entity.setPhone(request.getPhone());
        }
        if (StringUtils.hasText(request.getEmail())) {
            entity.setEmail(request.getEmail());
        }
        if (StringUtils.hasText(request.getAddress())) {
            entity.setAddress(request.getAddress());
        }
        if (StringUtils.hasText(request.getSupplierStatus())) {
            entity.setSupplierStatus(request.getSupplierStatus());
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
