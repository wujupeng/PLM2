package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmSupplierBlacklistQuery;
import com.huaweicloud.plm.system.dto.SrmSupplierBlacklistSaveRequest;
import com.huaweicloud.plm.system.entity.SrmSupplierBlacklist;
import com.huaweicloud.plm.system.mapper.SrmSupplierBlacklistMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 供应商全生命周期—供应商黑名单（对应 G4-N1，WBS T031）：
 * 黑名单记录登记、分页查询与删除。
 * 黑名单编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmSupplierBlacklistService {

    private static final String DEFAULT_BLACKLIST_NO_PREFIX = "BLK";
    private static final String DEFAULT_BLACKLIST_TYPE = "TEMPORARY";
    private static final String DEFAULT_BLACKLIST_STATUS = "ACTIVE";

    private final SrmSupplierBlacklistMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询黑名单记录：黑名单类型/黑名单状态/供应商编码精确，黑名单编号/供应商编码/供应商名称/申请人模糊，按主键倒序。 */
    public PageResult<SrmSupplierBlacklist> page(SrmSupplierBlacklistQuery query) {
        Page<SrmSupplierBlacklist> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmSupplierBlacklist>lambdaQuery()
                .eq(StringUtils.hasText(query.getBlacklistType()),
                        SrmSupplierBlacklist::getBlacklistType, query.getBlacklistType())
                .eq(StringUtils.hasText(query.getBlacklistStatus()),
                        SrmSupplierBlacklist::getBlacklistStatus, query.getBlacklistStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmSupplierBlacklist::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmSupplierBlacklist::getBlacklistNo, query.getKeyword()).or()
                        .like(SrmSupplierBlacklist::getSupplierCode, query.getKeyword()).or()
                        .like(SrmSupplierBlacklist::getSupplierName, query.getKeyword()).or()
                        .like(SrmSupplierBlacklist::getApplyBy, query.getKeyword()))
                .orderByDesc(SrmSupplierBlacklist::getId));
        return PageResult.of(page);
    }

    public SrmSupplierBlacklist detail(Long id) {
        return require(id);
    }

    /** 新增或更新黑名单记录：新增时回填默认黑名单类型/黑名单状态与组织，黑名单编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmSupplierBlacklistSaveRequest request) {
        SrmSupplierBlacklist entity;
        if (id == null) {
            entity = new SrmSupplierBlacklist();
            entity.setBlacklistNo(StringUtils.hasText(request.getBlacklistNo())
                    ? request.getBlacklistNo() : flowSupport.nextBizNo(DEFAULT_BLACKLIST_NO_PREFIX));
            entity.setBlacklistType(StringUtils.hasText(request.getBlacklistType())
                    ? request.getBlacklistType() : DEFAULT_BLACKLIST_TYPE);
            entity.setBlacklistStatus(StringUtils.hasText(request.getBlacklistStatus())
                    ? request.getBlacklistStatus() : DEFAULT_BLACKLIST_STATUS);
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

    /** 删除黑名单记录：物理删除以释放黑名单编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmSupplierBlacklist require(Long id) {
        SrmSupplierBlacklist entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "供应商黑名单记录不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmSupplierBlacklist entity, SrmSupplierBlacklistSaveRequest request) {
        if (StringUtils.hasText(request.getBlacklistNo())) {
            entity.setBlacklistNo(request.getBlacklistNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (StringUtils.hasText(request.getBlacklistType())) {
            entity.setBlacklistType(request.getBlacklistType());
        }
        if (StringUtils.hasText(request.getBlacklistReason())) {
            entity.setBlacklistReason(request.getBlacklistReason());
        }
        if (request.getEffectiveDate() != null) {
            entity.setEffectiveDate(request.getEffectiveDate());
        }
        if (request.getExpireDate() != null) {
            entity.setExpireDate(request.getExpireDate());
        }
        if (StringUtils.hasText(request.getApplyBy())) {
            entity.setApplyBy(request.getApplyBy());
        }
        if (StringUtils.hasText(request.getApprover())) {
            entity.setApprover(request.getApprover());
        }
        if (request.getApproveDate() != null) {
            entity.setApproveDate(request.getApproveDate());
        }
        if (StringUtils.hasText(request.getReleaseReason())) {
            entity.setReleaseReason(request.getReleaseReason());
        }
        if (StringUtils.hasText(request.getBlacklistStatus())) {
            entity.setBlacklistStatus(request.getBlacklistStatus());
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
