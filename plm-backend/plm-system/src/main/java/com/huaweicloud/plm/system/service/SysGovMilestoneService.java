package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SysGovMilestoneQuery;
import com.huaweicloud.plm.system.dto.SysGovMilestoneSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovMilestone;
import com.huaweicloud.plm.system.mapper.SysGovMilestoneMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 治理中心—项目治理—里程碑（G1-N7 公共平台底座 WBS T001 项目治理）：
 * 里程碑登记、分页查询与删除。
 * 里程碑编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysGovMilestoneService {

    private static final String DEFAULT_MILESTONE_STATUS = "PENDING";

    private final SysGovMilestoneMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询里程碑：项目/状态精确，编号/编码/名称模糊，按主键倒序。 */
    public PageResult<SysGovMilestone> pageMilestones(SysGovMilestoneQuery query) {
        Page<SysGovMilestone> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysGovMilestone>lambdaQuery()
                .eq(StringUtils.hasText(query.getProjectCode()),
                        SysGovMilestone::getProjectCode, query.getProjectCode())
                .eq(StringUtils.hasText(query.getMilestoneStatus()),
                        SysGovMilestone::getMilestoneStatus, query.getMilestoneStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysGovMilestone::getMilestoneNo, query.getKeyword()).or()
                        .like(SysGovMilestone::getMilestoneCode, query.getKeyword()).or()
                        .like(SysGovMilestone::getMilestoneName, query.getKeyword()))
                .orderByDesc(SysGovMilestone::getId));
        return PageResult.of(page);
    }

    public SysGovMilestone detail(Long id) {
        return require(id);
    }

    /** 新增或更新里程碑：新增时回填默认状态与组织，里程碑编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysGovMilestoneSaveRequest request) {
        SysGovMilestone entity;
        if (id == null) {
            entity = new SysGovMilestone();
            entity.setMilestoneNo(StringUtils.hasText(request.getMilestoneNo())
                    ? request.getMilestoneNo() : flowSupport.nextBizNo("GMS"));
            entity.setMilestoneStatus(StringUtils.hasText(request.getMilestoneStatus())
                    ? request.getMilestoneStatus() : DEFAULT_MILESTONE_STATUS);
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

    /** 删除里程碑：物理删除以释放里程碑编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysGovMilestone require(Long id) {
        SysGovMilestone entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "治理里程碑不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysGovMilestone entity, SysGovMilestoneSaveRequest request) {
        if (StringUtils.hasText(request.getMilestoneNo())) {
            entity.setMilestoneNo(request.getMilestoneNo());
        }
        if (StringUtils.hasText(request.getProjectCode())) {
            entity.setProjectCode(request.getProjectCode());
        }
        if (StringUtils.hasText(request.getMilestoneCode())) {
            entity.setMilestoneCode(request.getMilestoneCode());
        }
        if (StringUtils.hasText(request.getMilestoneName())) {
            entity.setMilestoneName(request.getMilestoneName());
        }
        if (request.getPlanDate() != null) {
            entity.setPlanDate(request.getPlanDate());
        }
        if (request.getActualDate() != null) {
            entity.setActualDate(request.getActualDate());
        }
        if (StringUtils.hasText(request.getMilestoneStatus())) {
            entity.setMilestoneStatus(request.getMilestoneStatus());
        }
        if (StringUtils.hasText(request.getOwnerName())) {
            entity.setOwnerName(request.getOwnerName());
        }
        if (StringUtils.hasText(request.getDeliverable())) {
            entity.setDeliverable(request.getDeliverable());
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
