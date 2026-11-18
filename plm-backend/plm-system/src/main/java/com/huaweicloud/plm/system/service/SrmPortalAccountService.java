package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmPortalAccountQuery;
import com.huaweicloud.plm.system.dto.SrmPortalAccountSaveRequest;
import com.huaweicloud.plm.system.entity.SrmPortalAccount;
import com.huaweicloud.plm.system.mapper.SrmPortalAccountMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 供应商门户—供应商账号（对应供应商门户账号）：
 * 门户账号登记、分页查询与删除。
 * 门户账号编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmPortalAccountService {

    private static final String DEFAULT_ACCOUNT_NO_PREFIX = "PAC";
    private static final String DEFAULT_PORTAL_ROLE = "VIEWER";
    private static final String DEFAULT_ACCOUNT_STATUS = "DRAFT";

    private final SrmPortalAccountMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询供应商门户账号记录：门户角色/账号状态/供应商编码精确，门户账号编号/供应商编码/供应商名称/登录名模糊，按主键倒序。 */
    public PageResult<SrmPortalAccount> page(SrmPortalAccountQuery query) {
        Page<SrmPortalAccount> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmPortalAccount>lambdaQuery()
                .eq(StringUtils.hasText(query.getPortalRole()),
                        SrmPortalAccount::getPortalRole, query.getPortalRole())
                .eq(StringUtils.hasText(query.getAccountStatus()),
                        SrmPortalAccount::getAccountStatus, query.getAccountStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmPortalAccount::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmPortalAccount::getAccountNo, query.getKeyword()).or()
                        .like(SrmPortalAccount::getSupplierCode, query.getKeyword()).or()
                        .like(SrmPortalAccount::getSupplierName, query.getKeyword()).or()
                        .like(SrmPortalAccount::getLoginName, query.getKeyword()))
                .orderByDesc(SrmPortalAccount::getId));
        return PageResult.of(page);
    }

    public SrmPortalAccount detail(Long id) {
        return require(id);
    }

    /** 新增或更新供应商门户账号记录：新增时回填默认门户角色、账号状态与组织，门户账号编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmPortalAccountSaveRequest request) {
        SrmPortalAccount entity;
        if (id == null) {
            entity = new SrmPortalAccount();
            entity.setAccountNo(StringUtils.hasText(request.getAccountNo())
                    ? request.getAccountNo() : flowSupport.nextBizNo(DEFAULT_ACCOUNT_NO_PREFIX));
            entity.setPortalRole(StringUtils.hasText(request.getPortalRole())
                    ? request.getPortalRole() : DEFAULT_PORTAL_ROLE);
            entity.setAccountStatus(StringUtils.hasText(request.getAccountStatus())
                    ? request.getAccountStatus() : DEFAULT_ACCOUNT_STATUS);
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

    /** 删除供应商门户账号记录：物理删除以释放门户账号编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmPortalAccount require(Long id) {
        SrmPortalAccount entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "供应商门户账号不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmPortalAccount entity, SrmPortalAccountSaveRequest request) {
        if (StringUtils.hasText(request.getAccountNo())) {
            entity.setAccountNo(request.getAccountNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (StringUtils.hasText(request.getLoginName())) {
            entity.setLoginName(request.getLoginName());
        }
        if (StringUtils.hasText(request.getContactName())) {
            entity.setContactName(request.getContactName());
        }
        if (StringUtils.hasText(request.getContactPhone())) {
            entity.setContactPhone(request.getContactPhone());
        }
        if (StringUtils.hasText(request.getContactEmail())) {
            entity.setContactEmail(request.getContactEmail());
        }
        if (StringUtils.hasText(request.getPortalRole())) {
            entity.setPortalRole(request.getPortalRole());
        }
        if (StringUtils.hasText(request.getCollabScope())) {
            entity.setCollabScope(request.getCollabScope());
        }
        if (request.getValidFrom() != null) {
            entity.setValidFrom(request.getValidFrom());
        }
        if (request.getValidTo() != null) {
            entity.setValidTo(request.getValidTo());
        }
        if (StringUtils.hasText(request.getAccountStatus())) {
            entity.setAccountStatus(request.getAccountStatus());
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
