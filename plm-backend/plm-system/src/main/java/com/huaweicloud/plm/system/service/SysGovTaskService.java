package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SysGovTaskQuery;
import com.huaweicloud.plm.system.dto.SysGovTaskSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovTask;
import com.huaweicloud.plm.system.mapper.SysGovTaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 治理中心—项目治理—治理任务（G1-N7 公共平台底座 WBS T001 项目治理）：
 * 任务登记、分页查询与删除。
 * 任务编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysGovTaskService {

    private static final String DEFAULT_TASK_TYPE = "DELIVERY";
    private static final String DEFAULT_TASK_STATUS = "TODO";
    private static final String DEFAULT_TASK_PRIORITY = "P1";
    private static final Integer DEFAULT_PROGRESS = 0;

    private final SysGovTaskMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询任务：项目/状态/优先级精确，编号/名称/负责人模糊，按主键倒序。 */
    public PageResult<SysGovTask> pageTasks(SysGovTaskQuery query) {
        Page<SysGovTask> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysGovTask>lambdaQuery()
                .eq(StringUtils.hasText(query.getProjectCode()),
                        SysGovTask::getProjectCode, query.getProjectCode())
                .eq(StringUtils.hasText(query.getTaskStatus()),
                        SysGovTask::getTaskStatus, query.getTaskStatus())
                .eq(StringUtils.hasText(query.getTaskPriority()),
                        SysGovTask::getTaskPriority, query.getTaskPriority())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysGovTask::getTaskNo, query.getKeyword()).or()
                        .like(SysGovTask::getTaskName, query.getKeyword()).or()
                        .like(SysGovTask::getAssignee, query.getKeyword()))
                .orderByDesc(SysGovTask::getId));
        return PageResult.of(page);
    }

    public SysGovTask detail(Long id) {
        return require(id);
    }

    /** 新增或更新任务：新增时回填默认类型/状态/优先级/进度与组织，任务编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysGovTaskSaveRequest request) {
        SysGovTask entity;
        if (id == null) {
            entity = new SysGovTask();
            entity.setTaskNo(StringUtils.hasText(request.getTaskNo())
                    ? request.getTaskNo() : flowSupport.nextBizNo("GTK"));
            entity.setTaskType(StringUtils.hasText(request.getTaskType())
                    ? request.getTaskType() : DEFAULT_TASK_TYPE);
            entity.setTaskStatus(StringUtils.hasText(request.getTaskStatus())
                    ? request.getTaskStatus() : DEFAULT_TASK_STATUS);
            entity.setTaskPriority(StringUtils.hasText(request.getTaskPriority())
                    ? request.getTaskPriority() : DEFAULT_TASK_PRIORITY);
            entity.setProgress(request.getProgress() == null ? DEFAULT_PROGRESS : request.getProgress());
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

    /** 删除任务：物理删除以释放任务编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysGovTask require(Long id) {
        SysGovTask entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "治理任务不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysGovTask entity, SysGovTaskSaveRequest request) {
        if (StringUtils.hasText(request.getTaskNo())) {
            entity.setTaskNo(request.getTaskNo());
        }
        if (StringUtils.hasText(request.getProjectCode())) {
            entity.setProjectCode(request.getProjectCode());
        }
        if (StringUtils.hasText(request.getMilestoneCode())) {
            entity.setMilestoneCode(request.getMilestoneCode());
        }
        if (StringUtils.hasText(request.getTaskName())) {
            entity.setTaskName(request.getTaskName());
        }
        if (StringUtils.hasText(request.getTaskType())) {
            entity.setTaskType(request.getTaskType());
        }
        if (StringUtils.hasText(request.getAssignee())) {
            entity.setAssignee(request.getAssignee());
        }
        if (request.getPlanStart() != null) {
            entity.setPlanStart(request.getPlanStart());
        }
        if (request.getPlanEnd() != null) {
            entity.setPlanEnd(request.getPlanEnd());
        }
        if (request.getActualEnd() != null) {
            entity.setActualEnd(request.getActualEnd());
        }
        if (request.getProgress() != null) {
            entity.setProgress(request.getProgress());
        }
        if (StringUtils.hasText(request.getTaskStatus())) {
            entity.setTaskStatus(request.getTaskStatus());
        }
        if (StringUtils.hasText(request.getTaskPriority())) {
            entity.setTaskPriority(request.getTaskPriority());
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
