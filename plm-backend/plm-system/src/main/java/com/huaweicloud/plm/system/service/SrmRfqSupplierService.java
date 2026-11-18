package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmRfqSupplierQuery;
import com.huaweicloud.plm.system.dto.SrmRfqSupplierSaveRequest;
import com.huaweicloud.plm.system.entity.SrmRfqSupplier;
import com.huaweicloud.plm.system.mapper.SrmRfqSupplierMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 寻源与询报价—询价邀请供应商（对应询价邀请供应商）：
 * 询价邀请记录登记、分页查询与删除。
 * 邀请单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmRfqSupplierService {

    private static final String DEFAULT_INVITE_NO_PREFIX = "INV";
    private static final String DEFAULT_INVITE_STATUS = "INVITED";

    private final SrmRfqSupplierMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询询价邀请记录：邀请状态/询价单号/供应商编码精确，邀请单号/询价单号/供应商编码/供应商名称模糊，按主键倒序。 */
    public PageResult<SrmRfqSupplier> page(SrmRfqSupplierQuery query) {
        Page<SrmRfqSupplier> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmRfqSupplier>lambdaQuery()
                .eq(StringUtils.hasText(query.getInviteStatus()),
                        SrmRfqSupplier::getInviteStatus, query.getInviteStatus())
                .eq(StringUtils.hasText(query.getRfqNo()),
                        SrmRfqSupplier::getRfqNo, query.getRfqNo())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmRfqSupplier::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmRfqSupplier::getInviteNo, query.getKeyword()).or()
                        .like(SrmRfqSupplier::getRfqNo, query.getKeyword()).or()
                        .like(SrmRfqSupplier::getSupplierCode, query.getKeyword()).or()
                        .like(SrmRfqSupplier::getSupplierName, query.getKeyword()))
                .orderByDesc(SrmRfqSupplier::getId));
        return PageResult.of(page);
    }

    public SrmRfqSupplier detail(Long id) {
        return require(id);
    }

    /** 新增或更新询价邀请记录：新增时回填默认邀请状态与组织，邀请单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmRfqSupplierSaveRequest request) {
        SrmRfqSupplier entity;
        if (id == null) {
            entity = new SrmRfqSupplier();
            entity.setInviteNo(StringUtils.hasText(request.getInviteNo())
                    ? request.getInviteNo() : flowSupport.nextBizNo(DEFAULT_INVITE_NO_PREFIX));
            entity.setInviteStatus(StringUtils.hasText(request.getInviteStatus())
                    ? request.getInviteStatus() : DEFAULT_INVITE_STATUS);
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

    /** 删除询价邀请记录：物理删除以释放邀请单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmRfqSupplier require(Long id) {
        SrmRfqSupplier entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "询价邀请记录不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmRfqSupplier entity, SrmRfqSupplierSaveRequest request) {
        if (StringUtils.hasText(request.getInviteNo())) {
            entity.setInviteNo(request.getInviteNo());
        }
        if (StringUtils.hasText(request.getRfqNo())) {
            entity.setRfqNo(request.getRfqNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
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
        if (request.getInviteDate() != null) {
            entity.setInviteDate(request.getInviteDate());
        }
        if (request.getRespondDate() != null) {
            entity.setRespondDate(request.getRespondDate());
        }
        if (StringUtils.hasText(request.getInviteStatus())) {
            entity.setInviteStatus(request.getInviteStatus());
        }
        if (StringUtils.hasText(request.getDeclineReason())) {
            entity.setDeclineReason(request.getDeclineReason());
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
