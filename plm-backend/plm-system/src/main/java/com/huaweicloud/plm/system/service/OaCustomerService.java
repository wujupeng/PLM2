package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizCustomerContactSaveRequest;
import com.huaweicloud.plm.system.dto.BizCustomerSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaCustomer;
import com.huaweicloud.plm.system.entity.OaCustomerContact;
import com.huaweicloud.plm.system.mapper.OaCustomerContactMapper;
import com.huaweicloud.plm.system.mapper.OaCustomerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 客户管理轻量模块（OA-DEV-083）：客户基础档案、联系人、关联查询。
 * 客户主数据权威归属为可配置项（oa.customer.master.authority，默认 ERP/CRM）；
 * OA 不产生冲突副本，仅在主数据未覆盖时承载轻量维护。
 */
@Service
@RequiredArgsConstructor
public class OaCustomerService {

    private final OaCustomerMapper mapper;
    private final OaCustomerContactMapper contactMapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaCustomer> page(OaBizFlowQuery query) {
        Page<OaCustomer> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaCustomer>lambdaQuery()
                .eq(query.getOrgId() != null, OaCustomer::getOrgId, query.getOrgId())
                .eq(StringUtils.hasText(query.getTypeCode()), OaCustomer::getCustomerStatus, query.getTypeCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaCustomer::getCustomerCode, query.getKeyword()).or()
                        .like(OaCustomer::getCustomerName, query.getKeyword()).or()
                        .like(OaCustomer::getShortName, query.getKeyword()))
                .orderByDesc(OaCustomer::getId));
        return PageResult.of(page);
    }

    public OaCustomer detail(Long id) {
        return requireEntity(id);
    }

    /** 客户联系人列表。 */
    public List<OaCustomerContact> listContacts(Long customerId) {
        requireEntity(customerId);
        return contactMapper.selectList(Wrappers.<OaCustomerContact>lambdaQuery()
                .eq(OaCustomerContact::getCustomerId, customerId)
                .orderByDesc(OaCustomerContact::getIsPrimary)
                .orderByAsc(OaCustomerContact::getId));
    }

    @Transactional
    public Long save(Long id, BizCustomerSaveRequest request) {
        if (!StringUtils.hasText(request.getCustomerName())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "客户名称不能为空");
        }
        OaCustomer entity;
        if (id == null) {
            entity = new OaCustomer();
            entity.setCustomerCode(StringUtils.hasText(request.getCustomerCode())
                    ? request.getCustomerCode() : flowSupport.nextBizNo("CU"));
            entity.setOrgId(currentOrgId());
            entity.setDataSource(flowSupport.configString("oa.customer.master.authority", "ERP"));
            entity.setContactCount(0);
        } else {
            entity = requireEntity(id);
            if (StringUtils.hasText(request.getCustomerCode())) {
                entity.setCustomerCode(request.getCustomerCode());
            }
        }
        entity.setCustomerName(request.getCustomerName());
        entity.setShortName(request.getShortName());
        entity.setCustomerLevel(request.getCustomerLevel());
        entity.setCustomerStatus(StringUtils.hasText(request.getCustomerStatus()) ? request.getCustomerStatus() : "ACTIVE");
        entity.setIndustry(request.getIndustry());
        entity.setRegion(request.getRegion());
        entity.setAddress(request.getAddress());
        entity.setCreditCode(request.getCreditCode());
        entity.setTaxNo(request.getTaxNo());
        entity.setSalesOwnerUserId(request.getSalesOwnerUserId());
        entity.setSalesOwnerName(request.getSalesOwnerName());
        entity.setErpRefNo(request.getErpRefNo());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    @Transactional
    public void delete(Long id) {
        requireEntity(id);
        contactMapper.delete(Wrappers.<OaCustomerContact>lambdaQuery()
                .eq(OaCustomerContact::getCustomerId, id));
        mapper.deleteById(id);
    }

    @Transactional
    public Long saveContact(Long customerId, BizCustomerContactSaveRequest request) {
        requireEntity(customerId);
        if (!StringUtils.hasText(request.getContactName())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "联系人姓名不能为空");
        }
        OaCustomerContact contact = new OaCustomerContact();
        contact.setCustomerId(customerId);
        contact.setContactName(request.getContactName());
        contact.setPosition(request.getPosition());
        contact.setPhone(request.getPhone());
        contact.setMobile(request.getMobile());
        contact.setEmail(request.getEmail());
        contact.setIsPrimary(Boolean.TRUE.equals(request.getIsPrimary()) ? 1 : 0);
        contact.setRemark(request.getRemark());
        contactMapper.insert(contact);
        refreshContactCount(customerId);
        return contact.getId();
    }

    @Transactional
    public void deleteContact(Long contactId) {
        OaCustomerContact contact = contactMapper.selectById(contactId);
        if (contact == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "客户联系人不存在: " + contactId);
        }
        contactMapper.deleteById(contactId);
        refreshContactCount(contact.getCustomerId());
    }

    public OaCustomer requireEntity(Long id) {
        OaCustomer entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "客户不存在: " + id);
        }
        return entity;
    }

    private void refreshContactCount(Long customerId) {
        Long count = contactMapper.selectCount(Wrappers.<OaCustomerContact>lambdaQuery()
                .eq(OaCustomerContact::getCustomerId, customerId));
        OaCustomer customer = mapper.selectById(customerId);
        if (customer != null) {
            customer.setContactCount(count == null ? 0 : count.intValue());
            mapper.updateById(customer);
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
