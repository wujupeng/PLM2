package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SysMdmChangeRequestQuery;
import com.huaweicloud.plm.system.dto.SysMdmChangeRequestSaveRequest;
import com.huaweicloud.plm.system.entity.SysMdmChangeRequest;
import com.huaweicloud.plm.system.mapper.SysMdmChangeRequestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/**
 * 主数据平台—变更申请（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 变更申请登记、分页查询与删除。
 * 变更申请编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysMdmChangeRequestService {

    private static final String DEFAULT_CHANGE_TYPE = "UPDATE";
    private static final String DEFAULT_REQUEST_STATUS = "SUBMITTED";

    private final SysMdmChangeRequestMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询变更申请：域/类型/状态精确，编号/主数据编码模糊，按主键倒序。 */
    public PageResult<SysMdmChangeRequest> pageChangeRequests(SysMdmChangeRequestQuery query) {
        Page<SysMdmChangeRequest> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysMdmChangeRequest>lambdaQuery()
                .eq(StringUtils.hasText(query.getDomainCode()),
                        SysMdmChangeRequest::getDomainCode, query.getDomainCode())
                .eq(StringUtils.hasText(query.getChangeType()),
                        SysMdmChangeRequest::getChangeType, query.getChangeType())
                .eq(StringUtils.hasText(query.getRequestStatus()),
                        SysMdmChangeRequest::getRequestStatus, query.getRequestStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysMdmChangeRequest::getChangeNo, query.getKeyword()).or()
                        .like(SysMdmChangeRequest::getMasterCode, query.getKeyword()))
                .orderByDesc(SysMdmChangeRequest::getId));
        return PageResult.of(page);
    }

    public SysMdmChangeRequest detail(Long id) {
        return require(id);
    }

    /** 新增或更新变更申请：新增时回填默认类型/状态、组织、申请时间与申请人，编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysMdmChangeRequestSaveRequest request) {
        SysMdmChangeRequest entity;
        if (id == null) {
            entity = new SysMdmChangeRequest();
            entity.setChangeNo(StringUtils.hasText(request.getChangeNo())
                    ? request.getChangeNo() : flowSupport.nextBizNo("MCR"));
            entity.setChangeType(StringUtils.hasText(request.getChangeType())
                    ? request.getChangeType() : DEFAULT_CHANGE_TYPE);
            entity.setRequestStatus(StringUtils.hasText(request.getRequestStatus())
                    ? request.getRequestStatus() : DEFAULT_REQUEST_STATUS);
            entity.setOrgId(currentOrgId());
            if (request.getApplyTime() == null) {
                entity.setApplyTime(LocalDateTime.now());
            }
            if (!StringUtils.hasText(request.getApplicantName())) {
                entity.setApplicantName(currentUserName());
            }
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

    /** 删除变更申请：物理删除以释放变更申请编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysMdmChangeRequest require(Long id) {
        SysMdmChangeRequest entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "主数据变更申请不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、时间非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysMdmChangeRequest entity, SysMdmChangeRequestSaveRequest request) {
        if (StringUtils.hasText(request.getChangeNo())) {
            entity.setChangeNo(request.getChangeNo());
        }
        if (StringUtils.hasText(request.getDomainCode())) {
            entity.setDomainCode(request.getDomainCode());
        }
        if (StringUtils.hasText(request.getMasterCode())) {
            entity.setMasterCode(request.getMasterCode());
        }
        if (StringUtils.hasText(request.getChangeType())) {
            entity.setChangeType(request.getChangeType());
        }
        if (StringUtils.hasText(request.getBeforeValue())) {
            entity.setBeforeValue(request.getBeforeValue());
        }
        if (StringUtils.hasText(request.getAfterValue())) {
            entity.setAfterValue(request.getAfterValue());
        }
        if (StringUtils.hasText(request.getChangeReason())) {
            entity.setChangeReason(request.getChangeReason());
        }
        if (StringUtils.hasText(request.getRequestStatus())) {
            entity.setRequestStatus(request.getRequestStatus());
        }
        if (StringUtils.hasText(request.getApplicantName())) {
            entity.setApplicantName(request.getApplicantName());
        }
        if (StringUtils.hasText(request.getApproverName())) {
            entity.setApproverName(request.getApproverName());
        }
        if (request.getApplyTime() != null) {
            entity.setApplyTime(request.getApplyTime());
        }
        if (request.getApproveTime() != null) {
            entity.setApproveTime(request.getApproveTime());
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

    private String currentUserName() {
        UserContext.Principal principal = UserContext.get();
        if (principal == null) {
            return null;
        }
        return StringUtils.hasText(principal.displayName()) ? principal.displayName() : principal.username();
    }
}
