package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.HrFlowQuery;
import com.huaweicloud.plm.system.dto.HrVisitorSaveRequest;
import com.huaweicloud.plm.system.entity.OaHrVisitor;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaHrVisitorMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 访客申请流程（OA-DEV-056）：来访登记、审批、签到与签退。
 * 访客信息属敏感数据，仅授权人员可查询；是否需审批、凭证有效期均为可配置项。
 */
@Service
@RequiredArgsConstructor
public class OaHrVisitorService {

    /** 流程编码，与 oa_process_definition.process_code 对应。 */
    public static final String PROCESS_CODE = "OA_VISITOR_FLOW";

    /** 业务类型，流程终态事件据此回写本单据状态。 */
    public static final String BIZ_TYPE = "HR_VISITOR";

    public static final String STATUS_DRAFT = "DRAFT";
    public static final String STATUS_APPLIED = "APPLIED";
    public static final String STATUS_APPROVED = "APPROVED";
    public static final String STATUS_CHECKED_IN = "CHECKED_IN";
    public static final String STATUS_CHECKED_OUT = "CHECKED_OUT";
    public static final String STATUS_REJECTED = "REJECTED";
    public static final String STATUS_CANCELLED = "CANCELLED";

    private final OaHrVisitorMapper visitorMapper;
    private final SysUserMapper userMapper;
    private final HrFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    public PageResult<OaHrVisitor> page(HrFlowQuery query, Long applicantUserId) {
        Page<OaHrVisitor> page = query.toPage();
        visitorMapper.selectPage(page, Wrappers.<OaHrVisitor>lambdaQuery()
                .eq(applicantUserId != null, OaHrVisitor::getApplicantUserId, applicantUserId)
                .eq(StringUtils.hasText(query.getFlowStatus()), OaHrVisitor::getFlowStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaHrVisitor::getOrgId, query.getOrgId())
                .ge(StringUtils.hasText(query.getStartDate()), OaHrVisitor::getVisitStart,
                        HrFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaHrVisitor::getVisitEnd,
                        HrFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaHrVisitor::getVisitorNo, query.getKeyword()).or()
                        .like(OaHrVisitor::getVisitorName, query.getKeyword()).or()
                        .like(OaHrVisitor::getVisitorCompany, query.getKeyword()).or()
                        .like(OaHrVisitor::getHostName, query.getKeyword()))
                .orderByDesc(OaHrVisitor::getId));
        return PageResult.of(page);
    }

    public OaHrVisitor detail(Long id) {
        return requireVisitor(id);
    }

    /** 保存访客登记：无 id 新建，有 id 修改；submit=true 时按配置决定是否走审批。 */
    @Transactional
    public Long save(Long id, HrVisitorSaveRequest request) {
        OaHrVisitor entity;
        if (id == null) {
            entity = new OaHrVisitor();
            entity.setVisitorNo(flowSupport.nextFlowNo("VS"));
            entity.setApplicantUserId(UserContext.getUserId());
            entity.setApplicantName(currentDisplayName());
            entity.setOrgId(currentOrgId());
            entity.setFlowStatus(STATUS_DRAFT);
            entity.setCancelFlag(0);
        } else {
            entity = requireVisitor(id);
            ensureEditable(entity);
        }
        validate(request);
        apply(entity, request);
        if (id == null) {
            visitorMapper.insert(entity);
        } else {
            visitorMapper.updateById(entity);
        }
        if (Boolean.TRUE.equals(request.getSubmit())) {
            submit(entity.getId());
        }
        return entity.getId();
    }

    /** 提交访客登记：配置 oa.hr.visitor.need.approval 为 false 时直接生效，不发起审批。 */
    @Transactional
    public void submit(Long id) {
        OaHrVisitor entity = requireVisitor(id);
        if (!isSubmittable(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "当前状态不可提交: " + entity.getFlowStatus());
        }
        if (!flowSupport.configBoolean("oa.hr.visitor.need.approval", true)) {
            entity.setFlowStatus(STATUS_APPROVED);
            visitorMapper.updateById(entity);
            return;
        }
        OaProcessInstance instance = flowSupport.startFlow(PROCESS_CODE, BIZ_TYPE, entity.getId(),
                buildTitle(entity), buildFormJson(entity));
        entity.setFlowStatus(STATUS_APPLIED);
        entity.setInstanceId(instance.getId());
        entity.setInstanceNo(instance.getInstanceNo());
        visitorMapper.updateById(entity);
    }

    @Transactional
    public void withdraw(Long id) {
        OaHrVisitor entity = requireVisitor(id);
        if (!STATUS_APPLIED.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅审批中的访客登记可撤回");
        }
        flowSupport.cancelFlow(entity.getInstanceId());
        entity.setFlowStatus(STATUS_CANCELLED);
        entity.setCancelFlag(1);
        visitorMapper.updateById(entity);
    }

    /** 到访签到：仅已批准的访客可签到。 */
    @Transactional
    public void checkin(Long id) {
        OaHrVisitor entity = requireVisitor(id);
        if (!STATUS_APPROVED.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅已批准的访客登记可签到");
        }
        entity.setFlowStatus(STATUS_CHECKED_IN);
        entity.setCheckinAt(LocalDateTime.now());
        visitorMapper.updateById(entity);
    }

    /** 离开签退：仅已签到的访客可签退。 */
    @Transactional
    public void checkout(Long id) {
        OaHrVisitor entity = requireVisitor(id);
        if (!STATUS_CHECKED_IN.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅已签到的访客登记可签退");
        }
        entity.setFlowStatus(STATUS_CHECKED_OUT);
        entity.setCheckoutAt(LocalDateTime.now());
        visitorMapper.updateById(entity);
    }

    @Transactional
    public void delete(Long id) {
        OaHrVisitor entity = requireVisitor(id);
        if (!STATUS_DRAFT.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的访客登记可删除");
        }
        visitorMapper.deleteById(id);
    }

    public OaHrVisitor requireVisitor(Long id) {
        OaHrVisitor entity = visitorMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "访客登记不存在: " + id);
        }
        return entity;
    }

    /** 流程终态回写：由 WorkflowInstanceEvent 监听器调用。 */
    @Transactional
    public void markFlowStatus(Long id, String flowStatus) {
        OaHrVisitor entity = visitorMapper.selectById(id);
        if (entity == null) {
            return;
        }
        entity.setFlowStatus(flowStatus);
        visitorMapper.updateById(entity);
    }

    private boolean isSubmittable(String flowStatus) {
        return STATUS_DRAFT.equals(flowStatus)
                || STATUS_REJECTED.equals(flowStatus)
                || STATUS_CANCELLED.equals(flowStatus);
    }

    private void ensureEditable(OaHrVisitor entity) {
        String status = entity.getFlowStatus();
        if (STATUS_APPLIED.equals(status) || STATUS_APPROVED.equals(status)
                || STATUS_CHECKED_IN.equals(status)) {
            throw new BusinessException(ResultCode.CONFLICT, "审批中或已生效的访客登记不可修改");
        }
    }

    private void validate(HrVisitorSaveRequest request) {
        if (!StringUtils.hasText(request.getVisitorName())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "访客姓名不能为空");
        }
        if (request.getVisitStart() != null && request.getVisitEnd() != null
                && request.getVisitEnd().isBefore(request.getVisitStart())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "来访结束时间不能早于开始时间");
        }
    }

    private void apply(OaHrVisitor entity, HrVisitorSaveRequest request) {
        entity.setVisitorName(request.getVisitorName());
        entity.setVisitorCompany(request.getVisitorCompany());
        entity.setVisitorPhone(request.getVisitorPhone());
        entity.setVisitorCount(request.getVisitorCount());
        entity.setVisitReason(request.getVisitReason());
        entity.setVisitArea(request.getVisitArea());
        entity.setVisitStart(request.getVisitStart());
        entity.setVisitEnd(request.getVisitEnd());
        entity.setVehicleNo(request.getVehicleNo());
        entity.setHostUserId(request.getHostUserId());
        entity.setHostName(resolveUserName(request.getHostUserId()));
        entity.setRemark(request.getRemark());
    }

    private String resolveUserName(Long userId) {
        if (userId == null) {
            return null;
        }
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            return null;
        }
        return StringUtils.hasText(user.getDisplayName()) ? user.getDisplayName() : user.getUsername();
    }

    private String buildTitle(OaHrVisitor entity) {
        return "访客申请-" + entity.getVisitorName() + "-" + entity.getVisitorNo();
    }

    private String buildFormJson(OaHrVisitor entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("visitorNo", entity.getVisitorNo());
        data.put("visitorName", entity.getVisitorName());
        data.put("visitorCompany", entity.getVisitorCompany());
        data.put("visitorCount", entity.getVisitorCount());
        data.put("visitReason", entity.getVisitReason());
        data.put("visitArea", entity.getVisitArea());
        data.put("visitStart", entity.getVisitStart() == null ? null : entity.getVisitStart().toString());
        data.put("visitEnd", entity.getVisitEnd() == null ? null : entity.getVisitEnd().toString());
        data.put("hostName", entity.getHostName());
        try {
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            return "{}";
        }
    }

    private String currentDisplayName() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.displayName();
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
