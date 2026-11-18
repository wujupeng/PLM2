package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpSalesReceivableQuery;
import com.huaweicloud.plm.system.dto.ErpSalesReceivableSaveRequest;
import com.huaweicloud.plm.system.entity.ErpSalesReceivable;
import com.huaweicloud.plm.system.mapper.ErpSalesReceivableMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 销售管理—应收账款（G3-N2 ERP 销售管理）：
 * 应收单登记、分页查询与删除。
 * 应收单编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpSalesReceivableService {

    private static final String DEFAULT_AR_NO_PREFIX = "SAR";
    private static final String DEFAULT_AR_STATUS = "OPEN";

    private final ErpSalesReceivableMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询应收单：状态/发票编号/客户编码精确，编号/发票编号/客户名称模糊，按主键倒序。 */
    public PageResult<ErpSalesReceivable> pageReceivables(ErpSalesReceivableQuery query) {
        Page<ErpSalesReceivable> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpSalesReceivable>lambdaQuery()
                .eq(StringUtils.hasText(query.getArStatus()),
                        ErpSalesReceivable::getArStatus, query.getArStatus())
                .eq(StringUtils.hasText(query.getInvoiceNo()),
                        ErpSalesReceivable::getInvoiceNo, query.getInvoiceNo())
                .eq(StringUtils.hasText(query.getCustomerCode()),
                        ErpSalesReceivable::getCustomerCode, query.getCustomerCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpSalesReceivable::getArNo, query.getKeyword()).or()
                        .like(ErpSalesReceivable::getInvoiceNo, query.getKeyword()).or()
                        .like(ErpSalesReceivable::getCustomerName, query.getKeyword()))
                .orderByDesc(ErpSalesReceivable::getId));
        return PageResult.of(page);
    }

    public ErpSalesReceivable detail(Long id) {
        return require(id);
    }

    /** 新增或更新应收单：新增时回填默认应收金额/已收金额/余额/状态与组织，编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpSalesReceivableSaveRequest request) {
        ErpSalesReceivable entity;
        if (id == null) {
            entity = new ErpSalesReceivable();
            entity.setArNo(StringUtils.hasText(request.getArNo())
                    ? request.getArNo() : flowSupport.nextBizNo(DEFAULT_AR_NO_PREFIX));
            entity.setArAmount(request.getArAmount() != null
                    ? request.getArAmount() : BigDecimal.ZERO);
            entity.setReceivedAmount(request.getReceivedAmount() != null
                    ? request.getReceivedAmount() : BigDecimal.ZERO);
            entity.setArBalance(request.getArBalance() != null
                    ? request.getArBalance() : BigDecimal.ZERO);
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

    /** 删除应收单：物理删除以释放应收单编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpSalesReceivable require(Long id) {
        ErpSalesReceivable entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "应收单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpSalesReceivable entity, ErpSalesReceivableSaveRequest request) {
        if (StringUtils.hasText(request.getArNo())) {
            entity.setArNo(request.getArNo());
        }
        if (StringUtils.hasText(request.getInvoiceNo())) {
            entity.setInvoiceNo(request.getInvoiceNo());
        }
        if (StringUtils.hasText(request.getOrderNo())) {
            entity.setOrderNo(request.getOrderNo());
        }
        if (StringUtils.hasText(request.getCustomerCode())) {
            entity.setCustomerCode(request.getCustomerCode());
        }
        if (StringUtils.hasText(request.getCustomerName())) {
            entity.setCustomerName(request.getCustomerName());
        }
        if (request.getArAmount() != null) {
            entity.setArAmount(request.getArAmount());
        }
        if (request.getReceivedAmount() != null) {
            entity.setReceivedAmount(request.getReceivedAmount());
        }
        if (request.getArBalance() != null) {
            entity.setArBalance(request.getArBalance());
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
