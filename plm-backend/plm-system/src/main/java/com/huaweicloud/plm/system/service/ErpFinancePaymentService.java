package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpFinancePaymentQuery;
import com.huaweicloud.plm.system.dto.ErpFinancePaymentSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinancePayment;
import com.huaweicloud.plm.system.mapper.ErpFinancePaymentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 财务—收付款单（对应 WBS T028 ERP 财务，属 G3 ERP）：
 * 收付款登记、分页查询与删除。
 * 收付款单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpFinancePaymentService {

    private static final String DEFAULT_PAYMENT_NO_PREFIX = "FPM";
    private static final String DEFAULT_PAYMENT_TYPE = "RECEIPT";
    private static final String DEFAULT_PARTY_TYPE = "CUSTOMER";
    private static final String DEFAULT_PAYMENT_METHOD = "TRANSFER";
    private static final String DEFAULT_CURRENCY_CODE = "CNY";
    private static final String DEFAULT_PAYMENT_STATUS = "DRAFT";

    private final ErpFinancePaymentMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询收付款单：类型/状态/往来单位编码精确，单号/往来单位名称模糊，按主键倒序。 */
    public PageResult<ErpFinancePayment> page(ErpFinancePaymentQuery query) {
        Page<ErpFinancePayment> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpFinancePayment>lambdaQuery()
                .eq(StringUtils.hasText(query.getPaymentType()),
                        ErpFinancePayment::getPaymentType, query.getPaymentType())
                .eq(StringUtils.hasText(query.getPaymentStatus()),
                        ErpFinancePayment::getPaymentStatus, query.getPaymentStatus())
                .eq(StringUtils.hasText(query.getPartyCode()),
                        ErpFinancePayment::getPartyCode, query.getPartyCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpFinancePayment::getPaymentNo, query.getKeyword()).or()
                        .like(ErpFinancePayment::getPartyName, query.getKeyword()))
                .orderByDesc(ErpFinancePayment::getId));
        return PageResult.of(page);
    }

    public ErpFinancePayment detail(Long id) {
        return require(id);
    }

    /** 新增或更新收付款单：新增时回填默认类型/单位类型/结算方式/金额/币种与状态及组织，单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpFinancePaymentSaveRequest request) {
        ErpFinancePayment entity;
        if (id == null) {
            entity = new ErpFinancePayment();
            entity.setPaymentNo(StringUtils.hasText(request.getPaymentNo())
                    ? request.getPaymentNo() : flowSupport.nextBizNo(DEFAULT_PAYMENT_NO_PREFIX));
            entity.setPaymentType(StringUtils.hasText(request.getPaymentType())
                    ? request.getPaymentType() : DEFAULT_PAYMENT_TYPE);
            entity.setPartyType(StringUtils.hasText(request.getPartyType())
                    ? request.getPartyType() : DEFAULT_PARTY_TYPE);
            entity.setPaymentMethod(StringUtils.hasText(request.getPaymentMethod())
                    ? request.getPaymentMethod() : DEFAULT_PAYMENT_METHOD);
            entity.setAmount(request.getAmount() != null
                    ? request.getAmount() : BigDecimal.ZERO);
            entity.setCurrencyCode(StringUtils.hasText(request.getCurrencyCode())
                    ? request.getCurrencyCode() : DEFAULT_CURRENCY_CODE);
            entity.setPaymentStatus(StringUtils.hasText(request.getPaymentStatus())
                    ? request.getPaymentStatus() : DEFAULT_PAYMENT_STATUS);
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

    /** 删除收付款单：物理删除以释放收付款单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpFinancePayment require(Long id) {
        ErpFinancePayment entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "收付款单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpFinancePayment entity, ErpFinancePaymentSaveRequest request) {
        if (StringUtils.hasText(request.getPaymentNo())) {
            entity.setPaymentNo(request.getPaymentNo());
        }
        if (StringUtils.hasText(request.getPaymentType())) {
            entity.setPaymentType(request.getPaymentType());
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
        if (StringUtils.hasText(request.getBankAccount())) {
            entity.setBankAccount(request.getBankAccount());
        }
        if (StringUtils.hasText(request.getBankName())) {
            entity.setBankName(request.getBankName());
        }
        if (StringUtils.hasText(request.getPaymentMethod())) {
            entity.setPaymentMethod(request.getPaymentMethod());
        }
        if (request.getAmount() != null) {
            entity.setAmount(request.getAmount());
        }
        if (StringUtils.hasText(request.getCurrencyCode())) {
            entity.setCurrencyCode(request.getCurrencyCode());
        }
        if (request.getPaymentDate() != null) {
            entity.setPaymentDate(request.getPaymentDate());
        }
        if (StringUtils.hasText(request.getSourceNo())) {
            entity.setSourceNo(request.getSourceNo());
        }
        if (StringUtils.hasText(request.getPaymentStatus())) {
            entity.setPaymentStatus(request.getPaymentStatus());
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
