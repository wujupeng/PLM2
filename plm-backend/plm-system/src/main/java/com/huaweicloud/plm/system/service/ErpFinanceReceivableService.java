package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpFinanceReceivableQuery;
import com.huaweicloud.plm.system.dto.ErpFinanceReceivableSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinanceReceivable;
import com.huaweicloud.plm.system.mapper.ErpFinanceReceivableMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 财务—应收单（对应 WBS T028 ERP 财务，属 G3 ERP）：
 * 应收登记、分页查询与删除。
 * 应收单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpFinanceReceivableService {

    private static final String DEFAULT_AR_NO_PREFIX = "FAR";
    private static final String DEFAULT_CURRENCY_CODE = "CNY";
    private static final String DEFAULT_AR_STATUS = "OPEN";

    private final ErpFinanceReceivableMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询应收单：状态/客户编码精确，应收单号/客户名称模糊，按主键倒序。 */
    public PageResult<ErpFinanceReceivable> page(ErpFinanceReceivableQuery query) {
        Page<ErpFinanceReceivable> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpFinanceReceivable>lambdaQuery()
                .eq(StringUtils.hasText(query.getArStatus()),
                        ErpFinanceReceivable::getArStatus, query.getArStatus())
                .eq(StringUtils.hasText(query.getCustomerCode()),
                        ErpFinanceReceivable::getCustomerCode, query.getCustomerCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpFinanceReceivable::getArNo, query.getKeyword()).or()
                        .like(ErpFinanceReceivable::getCustomerName, query.getKeyword()))
                .orderByDesc(ErpFinanceReceivable::getId));
        return PageResult.of(page);
    }

    public ErpFinanceReceivable detail(Long id) {
        return require(id);
    }

    /** 新增或更新应收单：新增时回填默认金额/币种与状态及组织，应收单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpFinanceReceivableSaveRequest request) {
        ErpFinanceReceivable entity;
        if (id == null) {
            entity = new ErpFinanceReceivable();
            entity.setArNo(StringUtils.hasText(request.getArNo())
                    ? request.getArNo() : flowSupport.nextBizNo(DEFAULT_AR_NO_PREFIX));
            entity.setArAmount(request.getArAmount() != null
                    ? request.getArAmount() : BigDecimal.ZERO);
            entity.setSettledAmount(request.getSettledAmount() != null
                    ? request.getSettledAmount() : BigDecimal.ZERO);
            entity.setArBalance(request.getArBalance() != null
                    ? request.getArBalance() : BigDecimal.ZERO);
            entity.setCurrencyCode(StringUtils.hasText(request.getCurrencyCode())
                    ? request.getCurrencyCode() : DEFAULT_CURRENCY_CODE);
            entity.setArStatus(StringUtils.hasText(request.getArStatus())
                    ? request.getArStatus() : DEFAULT_AR_STATUS);
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

    /** 删除应收单：物理删除以释放应收单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpFinanceReceivable require(Long id) {
        ErpFinanceReceivable entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "应收单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpFinanceReceivable entity, ErpFinanceReceivableSaveRequest request) {
        if (StringUtils.hasText(request.getArNo())) {
            entity.setArNo(request.getArNo());
        }
        if (StringUtils.hasText(request.getCustomerCode())) {
            entity.setCustomerCode(request.getCustomerCode());
        }
        if (StringUtils.hasText(request.getCustomerName())) {
            entity.setCustomerName(request.getCustomerName());
        }
        if (StringUtils.hasText(request.getInvoiceNo())) {
            entity.setInvoiceNo(request.getInvoiceNo());
        }
        if (StringUtils.hasText(request.getSourceNo())) {
            entity.setSourceNo(request.getSourceNo());
        }
        if (request.getArAmount() != null) {
            entity.setArAmount(request.getArAmount());
        }
        if (request.getSettledAmount() != null) {
            entity.setSettledAmount(request.getSettledAmount());
        }
        if (request.getArBalance() != null) {
            entity.setArBalance(request.getArBalance());
        }
        if (StringUtils.hasText(request.getCurrencyCode())) {
            entity.setCurrencyCode(request.getCurrencyCode());
        }
        if (request.getArDate() != null) {
            entity.setArDate(request.getArDate());
        }
        if (request.getDueDate() != null) {
            entity.setDueDate(request.getDueDate());
        }
        if (StringUtils.hasText(request.getArStatus())) {
            entity.setArStatus(request.getArStatus());
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
