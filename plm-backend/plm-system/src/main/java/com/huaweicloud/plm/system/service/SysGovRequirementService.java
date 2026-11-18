package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SysGovRequirementQuery;
import com.huaweicloud.plm.system.dto.SysGovRequirementSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovRequirement;
import com.huaweicloud.plm.system.mapper.SysGovRequirementMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 需求（G1-N7 公共平台底座—治理中心 WBS T004 需求追踪）：
 * 需求登记、分页查询与删除。
 * 需求编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysGovRequirementService {

    private static final String DEFAULT_REQ_TYPE = "BUSINESS";
    private static final String DEFAULT_REQ_PRIORITY = "P1";
    private static final String DEFAULT_REQ_STATUS = "PROPOSED";

    private final SysGovRequirementMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询需求：类型/状态/优先级/业务模块精确，编号/编码/名称模糊，按ID倒序。 */
    public PageResult<SysGovRequirement> pageRequirements(SysGovRequirementQuery query) {
        Page<SysGovRequirement> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysGovRequirement>lambdaQuery()
                .eq(StringUtils.hasText(query.getReqType()),
                        SysGovRequirement::getReqType, query.getReqType())
                .eq(StringUtils.hasText(query.getReqStatus()),
                        SysGovRequirement::getReqStatus, query.getReqStatus())
                .eq(StringUtils.hasText(query.getReqPriority()),
                        SysGovRequirement::getReqPriority, query.getReqPriority())
                .eq(StringUtils.hasText(query.getBizModule()),
                        SysGovRequirement::getBizModule, query.getBizModule())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysGovRequirement::getReqNo, query.getKeyword()).or()
                        .like(SysGovRequirement::getReqCode, query.getKeyword()).or()
                        .like(SysGovRequirement::getReqName, query.getKeyword()))
                .orderByDesc(SysGovRequirement::getId));
        return PageResult.of(page);
    }

    public SysGovRequirement detail(Long id) {
        return require(id);
    }

    /** 新增或更新需求：新增时回填默认类型/优先级/状态与组织，需求编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysGovRequirementSaveRequest request) {
        SysGovRequirement entity;
        if (id == null) {
            entity = new SysGovRequirement();
            entity.setReqNo(StringUtils.hasText(request.getReqNo())
                    ? request.getReqNo() : flowSupport.nextBizNo("GRQ"));
            entity.setReqType(StringUtils.hasText(request.getReqType())
                    ? request.getReqType() : DEFAULT_REQ_TYPE);
            entity.setReqPriority(StringUtils.hasText(request.getReqPriority())
                    ? request.getReqPriority() : DEFAULT_REQ_PRIORITY);
            entity.setReqStatus(StringUtils.hasText(request.getReqStatus())
                    ? request.getReqStatus() : DEFAULT_REQ_STATUS);
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

    /** 删除需求：物理删除以释放需求编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysGovRequirement require(Long id) {
        SysGovRequirement entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "需求不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空）时覆盖实体对应字段。 */
    private void applyRequest(SysGovRequirement entity, SysGovRequirementSaveRequest request) {
        if (StringUtils.hasText(request.getReqNo())) {
            entity.setReqNo(request.getReqNo());
        }
        if (StringUtils.hasText(request.getReqCode())) {
            entity.setReqCode(request.getReqCode());
        }
        if (StringUtils.hasText(request.getReqName())) {
            entity.setReqName(request.getReqName());
        }
        if (StringUtils.hasText(request.getReqType())) {
            entity.setReqType(request.getReqType());
        }
        if (StringUtils.hasText(request.getSource())) {
            entity.setSource(request.getSource());
        }
        if (StringUtils.hasText(request.getBizModule())) {
            entity.setBizModule(request.getBizModule());
        }
        if (StringUtils.hasText(request.getReqPriority())) {
            entity.setReqPriority(request.getReqPriority());
        }
        if (StringUtils.hasText(request.getReqStatus())) {
            entity.setReqStatus(request.getReqStatus());
        }
        if (StringUtils.hasText(request.getAcceptanceCriteria())) {
            entity.setAcceptanceCriteria(request.getAcceptanceCriteria());
        }
        if (StringUtils.hasText(request.getOwnerName())) {
            entity.setOwnerName(request.getOwnerName());
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
