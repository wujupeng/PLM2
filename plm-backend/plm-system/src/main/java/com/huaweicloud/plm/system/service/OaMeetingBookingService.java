package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MeetingBookingQuery;
import com.huaweicloud.plm.system.dto.MeetingBookingSaveRequest;
import com.huaweicloud.plm.system.entity.OaHrMeetingBooking;
import com.huaweicloud.plm.system.entity.OaHrMeetingRoom;
import com.huaweicloud.plm.system.mapper.OaHrMeetingBookingMapper;
import com.huaweicloud.plm.system.mapper.OaHrMeetingRoomMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/**
 * 会议室预约服务：预约单维护、时间段冲突校验与状态流转。
 */
@Service
@RequiredArgsConstructor
public class OaMeetingBookingService {

    /** 预约状态：已预约。 */
    public static final String STATUS_BOOKED = "BOOKED";
    /** 预约状态：已取消。 */
    public static final String STATUS_CANCELLED = "CANCELLED";
    /** 预约状态：已完成。 */
    public static final String STATUS_FINISHED = "FINISHED";

    private final OaHrMeetingBookingMapper bookingMapper;
    private final OaHrMeetingRoomMapper roomMapper;
    private final HrFlowSupport flowSupport;

    /** 预约分页：可由调用方限定组织者，其余条件按查询入参过滤。 */
    public PageResult<OaHrMeetingBooking> page(MeetingBookingQuery query, Long organizerUserId) {
        Page<OaHrMeetingBooking> page = query.toPage();
        bookingMapper.selectPage(page, Wrappers.<OaHrMeetingBooking>lambdaQuery()
                .eq(organizerUserId != null, OaHrMeetingBooking::getOrganizerUserId, organizerUserId)
                .eq(query.getRoomId() != null, OaHrMeetingBooking::getRoomId, query.getRoomId())
                .eq(StringUtils.hasText(query.getBookingStatus()),
                        OaHrMeetingBooking::getBookingStatus, query.getBookingStatus())
                .ge(StringUtils.hasText(query.getStartDate()), OaHrMeetingBooking::getStartTime,
                        HrFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaHrMeetingBooking::getStartTime,
                        HrFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaHrMeetingBooking::getBookingNo, query.getKeyword()).or()
                        .like(OaHrMeetingBooking::getSubject, query.getKeyword()).or()
                        .like(OaHrMeetingBooking::getRoomName, query.getKeyword()))
                .orderByDesc(OaHrMeetingBooking::getId));
        return PageResult.of(page);
    }

    public OaHrMeetingBooking requireBooking(Long id) {
        OaHrMeetingBooking booking = bookingMapper.selectById(id);
        if (booking == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "会议室预约不存在: " + id);
        }
        return booking;
    }

    public OaHrMeetingBooking detail(Long id) {
        return requireBooking(id);
    }

    /** 新建或更新预约单：先校验并归一化时间，再校验时间段冲突。 */
    @Transactional
    public Long save(Long id, MeetingBookingSaveRequest request) {
        LocalDateTime start = request.getStartTime();
        if (start == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "开始时间不能为空");
        }
        LocalDateTime end = request.getEndTime();
        // 未提供结束时间时按配置的默认时长推算。
        if (end == null) {
            end = start.plusMinutes(flowSupport.configInt("oa.meeting.default.duration.minutes", 60));
        }
        if (end.isBefore(start)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "结束时间不能早于开始时间");
        }
        validateConflict(id, request.getRoomId(), start, end);

        boolean isNew = id == null;
        OaHrMeetingBooking booking;
        if (isNew) {
            booking = new OaHrMeetingBooking();
            booking.setBookingNo(flowSupport.nextNo("MRB"));
            booking.setBookingStatus(STATUS_BOOKED);
            UserContext.Principal principal = UserContext.get();
            booking.setOrganizerUserId(UserContext.getUserId());
            booking.setOrganizerName(principal == null ? null : principal.displayName());
            booking.setOrgId(principal == null ? null : principal.orgId());
        } else {
            booking = requireBooking(id);
        }
        applyRequest(booking, request, start, end);
        if (isNew) {
            bookingMapper.insert(booking);
        } else {
            bookingMapper.updateById(booking);
        }
        return booking.getId();
    }

    /**
     * 时间段冲突校验：同一会议室下存在状态为已预约且区间与 [start, end) 重叠的记录时抛冲突。
     * 校验开关由配置项 oa.meeting.conflict.check 控制。
     */
    public void validateConflict(Long excludeId, Long roomId, LocalDateTime start, LocalDateTime end) {
        if (!flowSupport.configBoolean("oa.meeting.conflict.check", true)) {
            return;
        }
        if (roomId == null || start == null || end == null) {
            return;
        }
        long count = bookingMapper.selectCount(Wrappers.<OaHrMeetingBooking>lambdaQuery()
                .eq(OaHrMeetingBooking::getRoomId, roomId)
                .eq(OaHrMeetingBooking::getBookingStatus, STATUS_BOOKED)
                .ne(excludeId != null, OaHrMeetingBooking::getId, excludeId)
                .lt(OaHrMeetingBooking::getStartTime, end)
                .gt(OaHrMeetingBooking::getEndTime, start));
        if (count > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "该时间段会议室已被预约");
        }
    }

    /** 取消预约：仅已预约状态可取消。 */
    @Transactional
    public void cancel(Long id) {
        OaHrMeetingBooking booking = requireBooking(id);
        if (!STATUS_BOOKED.equals(booking.getBookingStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅已预约状态可取消");
        }
        booking.setBookingStatus(STATUS_CANCELLED);
        bookingMapper.updateById(booking);
    }

    /** 结束预约：置为已完成。 */
    @Transactional
    public void finish(Long id) {
        OaHrMeetingBooking booking = requireBooking(id);
        booking.setBookingStatus(STATUS_FINISHED);
        bookingMapper.updateById(booking);
    }

    /** 删除预约：逻辑删除，保留历史记录不物理清除。 */
    @Transactional
    public void delete(Long id) {
        requireBooking(id);
        bookingMapper.deleteById(id);
    }

    private void applyRequest(OaHrMeetingBooking booking, MeetingBookingSaveRequest request,
                              LocalDateTime start, LocalDateTime end) {
        booking.setRoomId(request.getRoomId());
        booking.setRoomName(resolveRoomName(request.getRoomId()));
        booking.setSubject(request.getSubject());
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setAttendeeJson(request.getAttendeeJson());
        booking.setAttendeeCount(request.getAttendeeCount());
        booking.setRemark(request.getRemark());
    }

    private String resolveRoomName(Long roomId) {
        if (roomId == null) {
            return null;
        }
        OaHrMeetingRoom room = roomMapper.selectById(roomId);
        return room == null ? null : room.getRoomName();
    }
}
