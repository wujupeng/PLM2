package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ScheduleQuery;
import com.huaweicloud.plm.system.dto.ScheduleSaveRequest;
import com.huaweicloud.plm.system.entity.OaOaSchedule;
import com.huaweicloud.plm.system.mapper.OaOaScheduleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/**
 * 日程服务：个人/部门日程维护与状态流转。
 */
@Service
@RequiredArgsConstructor
public class OaScheduleService {

    /** 日程状态：有效。 */
    public static final String STATUS_ACTIVE = "ACTIVE";
    /** 日程状态：已取消。 */
    public static final String STATUS_CANCELLED = "CANCELLED";
    /** 日程状态：已完成。 */
    public static final String STATUS_FINISHED = "FINISHED";

    private final OaOaScheduleMapper scheduleMapper;
    private final HrFlowSupport flowSupport;

    /** 日程分页：可由调用方限定属主，其余条件按查询入参过滤。 */
    public PageResult<OaOaSchedule> page(ScheduleQuery query, Long ownerUserId) {
        Page<OaOaSchedule> page = query.toPage();
        scheduleMapper.selectPage(page, Wrappers.<OaOaSchedule>lambdaQuery()
                .eq(ownerUserId != null, OaOaSchedule::getOwnerUserId, ownerUserId)
                .eq(StringUtils.hasText(query.getScheduleType()),
                        OaOaSchedule::getScheduleType, query.getScheduleType())
                .ge(StringUtils.hasText(query.getStartDate()), OaOaSchedule::getStartTime,
                        HrFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaOaSchedule::getStartTime,
                        HrFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaOaSchedule::getScheduleNo, query.getKeyword()).or()
                        .like(OaOaSchedule::getTitle, query.getKeyword()).or()
                        .like(OaOaSchedule::getContent, query.getKeyword()))
                .orderByDesc(OaOaSchedule::getId));
        return PageResult.of(page);
    }

    public OaOaSchedule requireSchedule(Long id) {
        OaOaSchedule schedule = scheduleMapper.selectById(id);
        if (schedule == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "日程不存在: " + id);
        }
        return schedule;
    }

    public OaOaSchedule detail(Long id) {
        return requireSchedule(id);
    }

    /** 新建或更新日程：校验时间后落库，新建时补全编号、属主与默认状态。 */
    @Transactional
    public Long save(Long id, ScheduleSaveRequest request) {
        LocalDateTime start = request.getStartTime();
        LocalDateTime end = request.getEndTime();
        if (start == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "开始时间不能为空");
        }
        if (end == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "结束时间不能为空");
        }
        if (end.isBefore(start)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "结束时间不能早于开始时间");
        }

        boolean isNew = id == null;
        OaOaSchedule schedule;
        if (isNew) {
            schedule = new OaOaSchedule();
            schedule.setScheduleNo(flowSupport.nextNo("SCH"));
            schedule.setScheduleStatus(STATUS_ACTIVE);
            UserContext.Principal principal = UserContext.get();
            schedule.setOwnerUserId(UserContext.getUserId());
            schedule.setOwnerName(principal == null ? null : principal.displayName());
            schedule.setOrgId(principal == null ? null : principal.orgId());
        } else {
            schedule = requireSchedule(id);
        }
        applyRequest(schedule, request);
        // 新建时未指定提醒时间则取配置默认值。
        if (isNew && schedule.getRemindMinutes() == null) {
            schedule.setRemindMinutes(flowSupport.configInt("oa.schedule.remind.default.minutes", 15));
        }
        if (isNew) {
            scheduleMapper.insert(schedule);
        } else {
            scheduleMapper.updateById(schedule);
        }
        return schedule.getId();
    }

    /** 取消日程。 */
    @Transactional
    public void cancel(Long id) {
        OaOaSchedule schedule = requireSchedule(id);
        schedule.setScheduleStatus(STATUS_CANCELLED);
        scheduleMapper.updateById(schedule);
    }

    /** 完成日程。 */
    @Transactional
    public void finish(Long id) {
        OaOaSchedule schedule = requireSchedule(id);
        schedule.setScheduleStatus(STATUS_FINISHED);
        scheduleMapper.updateById(schedule);
    }

    @Transactional
    public void delete(Long id) {
        requireSchedule(id);
        scheduleMapper.deleteById(id);
    }

    private void applyRequest(OaOaSchedule schedule, ScheduleSaveRequest request) {
        schedule.setTitle(request.getTitle());
        schedule.setScheduleType(request.getScheduleType());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setAllDayFlag(request.getAllDayFlag());
        schedule.setLocation(request.getLocation());
        schedule.setParticipantJson(request.getParticipantJson());
        schedule.setShareScope(request.getShareScope());
        schedule.setRemindMinutes(request.getRemindMinutes());
        schedule.setContent(request.getContent());
        schedule.setRemark(request.getRemark());
    }
}
