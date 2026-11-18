package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpCustomerContactQuery;
import com.huaweicloud.plm.system.dto.ErpCustomerContactSaveRequest;
import com.huaweicloud.plm.system.entity.ErpCustomerContact;
import com.huaweicloud.plm.system.mapper.ErpCustomerContactMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * ERP 基础资料—客户联系人（G3-N1 ERP 基础资料 WBS T021）：
 * 客户联系人登记、分页查询与删除。
 * 联系人编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpCustomerContactService {

    private static final Integer DEFAULT_IS_PRIMARY = 0;
    private static final String DEFAULT_CONTACT_STATUS = "ACTIVE";

    private final ErpCustomerContactMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询客户联系人：状态精确，编号/姓名/客户编码模糊，按主键倒序。 */
    public PageResult<ErpCustomerContact> pageCustomerContacts(ErpCustomerContactQuery query) {
        Page<ErpCustomerContact> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpCustomerContact>lambdaQuery()
                .eq(StringUtils.hasText(query.getContactStatus()),
                        ErpCustomerContact::getContactStatus, query.getContactStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpCustomerContact::getContactNo, query.getKeyword()).or()
                        .like(ErpCustomerContact::getContactName, query.getKeyword()).or()
                        .like(ErpCustomerContact::getCustomerCode, query.getKeyword()))
                .orderByDesc(ErpCustomerContact::getId));
        return PageResult.of(page);
    }

    public ErpCustomerContact detail(Long id) {
        return require(id);
    }

    /** 新增或更新客户联系人：新增时回填默认主联系人标识/状态与组织，编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpCustomerContactSaveRequest request) {
        ErpCustomerContact entity;
        if (id == null) {
            entity = new ErpCustomerContact();
            entity.setContactNo(StringUtils.hasText(request.getContactNo())
                    ? request.getContactNo() : flowSupport.nextBizNo("ECCT"));
            entity.setIsPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : DEFAULT_IS_PRIMARY);
            entity.setContactStatus(StringUtils.hasText(request.getContactStatus())
                    ? request.getContactStatus() : DEFAULT_CONTACT_STATUS);
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

    /** 删除客户联系人：物理删除以释放联系人编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpCustomerContact require(Long id) {
        ErpCustomerContact entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "客户联系人不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空 / 数值非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpCustomerContact entity, ErpCustomerContactSaveRequest request) {
        if (StringUtils.hasText(request.getContactNo())) {
            entity.setContactNo(request.getContactNo());
        }
        if (StringUtils.hasText(request.getCustomerCode())) {
            entity.setCustomerCode(request.getCustomerCode());
        }
        if (StringUtils.hasText(request.getContactName())) {
            entity.setContactName(request.getContactName());
        }
        if (StringUtils.hasText(request.getPositionName())) {
            entity.setPositionName(request.getPositionName());
        }
        if (StringUtils.hasText(request.getPhone())) {
            entity.setPhone(request.getPhone());
        }
        if (StringUtils.hasText(request.getEmail())) {
            entity.setEmail(request.getEmail());
        }
        if (request.getIsPrimary() != null) {
            entity.setIsPrimary(request.getIsPrimary());
        }
        if (StringUtils.hasText(request.getContactStatus())) {
            entity.setContactStatus(request.getContactStatus());
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
