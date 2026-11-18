package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpFinancePayableQuery;
import com.huaweicloud.plm.system.dto.ErpFinancePayableSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinancePayable;
import com.huaweicloud.plm.system.mapper.ErpFinancePayableMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 财务—应付单（对应 WBS T028 ERP 财务，属 G3 ERP）：
 * 应付登记、分页查询与删除。
 * 应付单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpFinancePayableService {

    private static final String DEFAULT_AP_NO_PREFIX = "FAP";
    private static final String DEFAULT_CURRENCY_CODE = "CNY";
    private static final String DEFAULT_AP_STATUS = "OPEN";

    private final ErpFinancePayableMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询应付单：状态/供应商编码精确，应付单号/供应商名称模糊，按主键倒序。 */
    public PageResult<ErpFinancePayable> page(ErpFinancePayableQuery query) {
        Page<ErpFinancePayable> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpFinancePayable>lambdaQuery()
                .eq(StringUtils.hasText(query.getApStatus()),
                        ErpFinancePayable::getApStatus, query.getApStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        ErpFinancePayable::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpFinancePayable::getApNo, query.getKeyword()).or()
                        .like(ErpFinancePayable::getSupplierName, query.getKeyword()))
                .orderByDesc(ErpFinancePayable::getId));
        return PageResult.of(page);
    }

    public ErpFinancePayable detail(Long id) {
        return require(id);
    }

    /** 新增或更新应付单：新增时回填默认金额/币种与状态及组织，应付单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpFinancePayableSaveRequest request) {
        ErpFinancePayable entity;
        if (id == null) {
            entity = new ErpFinancePayable();
            entity.setApNo(StringUtils.hasText(request.getApNo())
                    ? request.getApNo() : flowSupport.nextBizNo(DEFAULT_AP_NO_PREFIX));
            entity.setApAmount(request.getApAmount() != null
                    ? request.getApAmount() : BigDecimal.ZERO);
            entity.setSettledAmount(request.getSettledAmount() != null
                    ? request.getSettledAmount() : BigDecimal.ZERO);
            entity.setApBalance(request.getApBalance() != null
                    ? request.getApBalance() : BigDecimal.ZERO);
            entity.setCurrencyCode(StringUtils.hasText(request.getCurrencyCode())
                    ? request.getCurrencyCode() : DEFAULT_CURRENCY_CODE);
            entity.setApStatus(StringUtils.hasText(request.getApStatus())
                    ? request.getApStatus() : DEFAULT_AP_STATUS);
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

    /** 删除应付单：物理删除以释放应付单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpFinancePayable require(Long id) {
        ErpFinancePayable entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "应付单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpFinancePayable entity, ErpFinancePayableSaveRequest request) {
        if (StringUtils.hasText(request.getApNo())) {
            entity.setApNo(request.getApNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (StringUtils.hasText(request.getInvoiceNo())) {
            entity.setInvoiceNo(request.getInvoiceNo());
        }
        if (StringUtils.hasText(request.getSourceNo())) {
            entity.setSourceNo(request.getSourceNo());
        }
        if (request.getApAmount() != null) {
            entity.setApAmount(request.getApAmount());
        }
        if (request.getSettledAmount() != null) {
            entity.setSettledAmount(request.getSettledAmount());
        }
        if (request.getApBalance() != null) {
            entity.setApBalance(request.getApBalance());
        }
        if (StringUtils.hasText(request.getCurrencyCode())) {
            entity.setCurrencyCode(request.getCurrencyCode());
        }
        if (request.getApDate() != null) {
            entity.setApDate(request.getApDate());
        }
        if (request.getDueDate() != null) {
            entity.setDueDate(request.getDueDate());
        }
        if (StringUtils.hasText(request.getApStatus())) {
            entity.setApStatus(request.getApStatus());
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
