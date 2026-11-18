package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ApprovalTaskActionRequest;
import com.huaweicloud.plm.system.dto.ApprovalTaskQuery;
import com.huaweicloud.plm.system.dto.SysApprovalTaskSaveRequest;
import com.huaweicloud.plm.system.entity.SysApprovalTask;
import com.huaweicloud.plm.system.mapper.SysApprovalTaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 审批任务（G1-N6 公共平台底座—通用能力 WBS T103 可配置审批）：
 * 任务登记、按状态统计与通过/驳回/转办/重置状态动作。
 * 任务编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysApprovalTaskService {

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_APPROVED = "APPROVED";
    private static final String STATUS_REJECTED = "REJECTED";
    private static final String STATUS_TRANSFERRED = "TRANSFERRED";

    private final SysApprovalTaskMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询审批任务：实例编号/节点编号/任务状态精确，审批人姓名模糊，时间区间作用于创建时间。 */
    public PageResult<SysApprovalTask> pageTasks(ApprovalTaskQuery query) {
        Page<SysApprovalTask> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysApprovalTask>lambdaQuery()
                .eq(StringUtils.hasText(query.getInstanceNo()),
                        SysApprovalTask::getInstanceNo, query.getInstanceNo())
                .eq(StringUtils.hasText(query.getNodeNo()),
                        SysApprovalTask::getNodeNo, query.getNodeNo())
                .like(StringUtils.hasText(query.getApproverName()),
                        SysApprovalTask::getApproverName, query.getApproverName())
                .eq(StringUtils.hasText(query.getTaskStatus()),
                        SysApprovalTask::getTaskStatus, query.getTaskStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysApprovalTask::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysApprovalTask::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysApprovalTask::getTaskNo, query.getKeyword()).or()
                        .like(SysApprovalTask::getInstanceNo, query.getKeyword()).or()
                        .like(SysApprovalTask::getApproverName, query.getKeyword()))
                .orderByDesc(SysApprovalTask::getId));
        return PageResult.of(page);
    }

    public SysApprovalTask detail(Long id) {
        return require(id);
    }

    /** 新增或更新审批任务：新增时回填默认任务状态与组织，任务编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysApprovalTaskSaveRequest request) {
        SysApprovalTask entity;
        if (id == null) {
            entity = new SysApprovalTask();
            entity.setTaskNo(StringUtils.hasText(request.getTaskNo())
                    ? request.getTaskNo() : flowSupport.nextBizNo("APT"));
            entity.setTaskStatus(StringUtils.hasText(request.getTaskStatus())
                    ? request.getTaskStatus() : STATUS_PENDING);
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

    /** 通过：任务状态置为 APPROVED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysApprovalTask approve(Long id, ApprovalTaskActionRequest request) {
        return handle(id, STATUS_APPROVED, request);
    }

    /** 驳回：任务状态置为 REJECTED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysApprovalTask reject(Long id, ApprovalTaskActionRequest request) {
        return handle(id, STATUS_REJECTED, request);
    }

    /** 转办：任务状态置为 TRANSFERRED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysApprovalTask transfer(Long id, ApprovalTaskActionRequest request) {
        return handle(id, STATUS_TRANSFERRED, request);
    }

    /** 重置：任务状态置为 PENDING。 */
    @Transactional(rollbackFor = Exception.class)
    public SysApprovalTask reset(Long id, ApprovalTaskActionRequest request) {
        return handle(id, STATUS_PENDING, request);
    }

    /** 删除审批任务：物理删除以释放任务编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 审批任务统计：按任务状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("pending", countBy(SysApprovalTask::getTaskStatus, STATUS_PENDING));
        result.put("approved", countBy(SysApprovalTask::getTaskStatus, STATUS_APPROVED));
        result.put("rejected", countBy(SysApprovalTask::getTaskStatus, STATUS_REJECTED));
        result.put("transferred", countBy(SysApprovalTask::getTaskStatus, STATUS_TRANSFERRED));
        return result;
    }

    public SysApprovalTask require(Long id) {
        SysApprovalTask entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "审批任务不存在: " + id);
        }
        return entity;
    }

    /** 处理任务：置目标状态与处理时间，请求携带处理意见时一并回写。 */
    private SysApprovalTask handle(Long id, String taskStatus, ApprovalTaskActionRequest request) {
        SysApprovalTask entity = require(id);
        entity.setTaskStatus(taskStatus);
        entity.setHandledTime(LocalDateTime.now());
        if (request != null && StringUtils.hasText(request.getHandleComment())) {
            entity.setHandleComment(request.getHandleComment());
        }
        mapper.updateById(entity);
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/时间非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysApprovalTask entity, SysApprovalTaskSaveRequest request) {
        if (StringUtils.hasText(request.getTaskNo())) {
            entity.setTaskNo(request.getTaskNo());
        }
        if (StringUtils.hasText(request.getInstanceNo())) {
            entity.setInstanceNo(request.getInstanceNo());
        }
        if (StringUtils.hasText(request.getNodeNo())) {
            entity.setNodeNo(request.getNodeNo());
        }
        if (request.getApproverId() != null) {
            entity.setApproverId(request.getApproverId());
        }
        if (StringUtils.hasText(request.getApproverName())) {
            entity.setApproverName(request.getApproverName());
        }
        if (StringUtils.hasText(request.getTaskStatus())) {
            entity.setTaskStatus(request.getTaskStatus());
        }
        if (StringUtils.hasText(request.getHandleComment())) {
            entity.setHandleComment(request.getHandleComment());
        }
        if (request.getHandledTime() != null) {
            entity.setHandledTime(request.getHandledTime());
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

    private Long countBy(SFunction<SysApprovalTask, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysApprovalTask>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
