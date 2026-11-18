package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpCustomerQuery;
import com.huaweicloud.plm.system.dto.ErpCustomerSaveRequest;
import com.huaweicloud.plm.system.entity.ErpCustomer;
import com.huaweicloud.plm.system.mapper.ErpCustomerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 基础资料—客户业务档案（G3-N1 ERP 基础资料 WBS T021）：
 * 客户档案登记、分页查询与删除。
 * 客户编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpCustomerService {

    private static final String DEFAULT_CUSTOMER_NO_PREFIX = "ECUS";
    private static final String DEFAULT_CUSTOMER_TYPE = "DIRECT";
    private static final String DEFAULT_SETTLE_METHOD = "TRANSFER";
    private static final String DEFAULT_CUSTOMER_STATUS = "ACTIVE";

    private final ErpCustomerMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询客户档案：类型/状态精确，编号/编码/名称模糊，按主键倒序。 */
    public PageResult<ErpCustomer> pageCustomers(ErpCustomerQuery query) {
        Page<ErpCustomer> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpCustomer>lambdaQuery()
                .eq(StringUtils.hasText(query.getCustomerType()),
                        ErpCustomer::getCustomerType, query.getCustomerType())
                .eq(StringUtils.hasText(query.getCustomerStatus()),
                        ErpCustomer::getCustomerStatus, query.getCustomerStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpCustomer::getCustomerNo, query.getKeyword()).or()
                        .like(ErpCustomer::getCustomerCode, query.getKeyword()).or()
                        .like(ErpCustomer::getCustomerName, query.getKeyword()))
                .orderByDesc(ErpCustomer::getId));
        return PageResult.of(page);
    }

    public ErpCustomer detail(Long id) {
        return require(id);
    }

    /** 新增或更新客户档案：新增时回填默认类型/信用额度/账期/结算方式/状态与组织，编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpCustomerSaveRequest request) {
        ErpCustomer entity;
        if (id == null) {
            entity = new ErpCustomer();
            entity.setCustomerNo(StringUtils.hasText(request.getCustomerNo())
                    ? request.getCustomerNo() : flowSupport.nextBizNo(DEFAULT_CUSTOMER_NO_PREFIX));
            entity.setCustomerType(StringUtils.hasText(request.getCustomerType())
                    ? request.getCustomerType() : DEFAULT_CUSTOMER_TYPE);
            entity.setCreditLimit(request.getCreditLimit() != null
                    ? request.getCreditLimit() : BigDecimal.ZERO);
            entity.setCreditDays(request.getCreditDays() != null
                    ? request.getCreditDays() : 0);
            entity.setSettleMethod(StringUtils.hasText(request.getSettleMethod())
                    ? request.getSettleMethod() : DEFAULT_SETTLE_METHOD);
            entity.setCustomerStatus(StringUtils.hasText(request.getCustomerStatus())
                    ? request.getCustomerStatus() : DEFAULT_CUSTOMER_STATUS);
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

    /** 删除客户档案：物理删除以释放客户编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpCustomer require(Long id) {
        ErpCustomer entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "客户业务档案不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpCustomer entity, ErpCustomerSaveRequest request) {
        if (StringUtils.hasText(request.getCustomerNo())) {
            entity.setCustomerNo(request.getCustomerNo());
        }
        if (StringUtils.hasText(request.getCustomerCode())) {
            entity.setCustomerCode(request.getCustomerCode());
        }
        if (StringUtils.hasText(request.getCustomerName())) {
            entity.setCustomerName(request.getCustomerName());
        }
        if (StringUtils.hasText(request.getShortName())) {
            entity.setShortName(request.getShortName());
        }
        if (StringUtils.hasText(request.getCustomerType())) {
            entity.setCustomerType(request.getCustomerType());
        }
        if (StringUtils.hasText(request.getCustomerGroup())) {
            entity.setCustomerGroup(request.getCustomerGroup());
        }
        if (StringUtils.hasText(request.getSalesRegion())) {
            entity.setSalesRegion(request.getSalesRegion());
        }
        if (request.getCreditLimit() != null) {
            entity.setCreditLimit(request.getCreditLimit());
        }
        if (request.getCreditDays() != null) {
            entity.setCreditDays(request.getCreditDays());
        }
        if (StringUtils.hasText(request.getSettleMethod())) {
            entity.setSettleMethod(request.getSettleMethod());
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
        if (StringUtils.hasText(request.getCustomerStatus())) {
            entity.setCustomerStatus(request.getCustomerStatus());
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
