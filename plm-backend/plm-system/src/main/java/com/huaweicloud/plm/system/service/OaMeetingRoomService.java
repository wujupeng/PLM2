package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.MeetingRoomQuery;
import com.huaweicloud.plm.system.dto.MeetingRoomSaveRequest;
import com.huaweicloud.plm.system.entity.OaHrMeetingRoom;
import com.huaweicloud.plm.system.mapper.OaHrMeetingRoomMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 会议室管理服务：会议室基础信息维护与启用列表查询。
 */
@Service
@RequiredArgsConstructor
public class OaMeetingRoomService {

    /** 会议室状态：启用。 */
    private static final String STATUS_ENABLED = "ENABLED";

    private final OaHrMeetingRoomMapper meetingRoomMapper;

    /** 会议室分页：按状态过滤，关键词模糊匹配编码/名称/位置。 */
    public PageResult<OaHrMeetingRoom> page(MeetingRoomQuery query) {
        Page<OaHrMeetingRoom> page = query.toPage();
        meetingRoomMapper.selectPage(page, Wrappers.<OaHrMeetingRoom>lambdaQuery()
                .eq(StringUtils.hasText(query.getRoomStatus()),
                        OaHrMeetingRoom::getRoomStatus, query.getRoomStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaHrMeetingRoom::getRoomCode, query.getKeyword()).or()
                        .like(OaHrMeetingRoom::getRoomName, query.getKeyword()).or()
                        .like(OaHrMeetingRoom::getLocation, query.getKeyword()))
                .orderByDesc(OaHrMeetingRoom::getId));
        return PageResult.of(page);
    }

    /** 启用会议室列表：供预约下拉选择。 */
    public List<OaHrMeetingRoom> listAll() {
        return meetingRoomMapper.selectList(Wrappers.<OaHrMeetingRoom>lambdaQuery()
                .eq(OaHrMeetingRoom::getRoomStatus, STATUS_ENABLED)
                .orderByAsc(OaHrMeetingRoom::getRoomCode));
    }

    public OaHrMeetingRoom requireRoom(Long id) {
        OaHrMeetingRoom room = meetingRoomMapper.selectById(id);
        if (room == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "会议室不存在: " + id);
        }
        return room;
    }

    public OaHrMeetingRoom detail(Long id) {
        return requireRoom(id);
    }

    @Transactional
    public Long create(MeetingRoomSaveRequest request) {
        OaHrMeetingRoom room = new OaHrMeetingRoom();
        applyRequest(room, request);
        // 新建时未指定状态默认启用。
        if (!StringUtils.hasText(room.getRoomStatus())) {
            room.setRoomStatus(STATUS_ENABLED);
        }
        meetingRoomMapper.insert(room);
        return room.getId();
    }

    @Transactional
    public void update(Long id, MeetingRoomSaveRequest request) {
        OaHrMeetingRoom room = requireRoom(id);
        applyRequest(room, request);
        meetingRoomMapper.updateById(room);
    }

    @Transactional
    public void delete(Long id) {
        meetingRoomMapper.deleteById(id);
    }

    private void applyRequest(OaHrMeetingRoom room, MeetingRoomSaveRequest request) {
        room.setRoomCode(request.getRoomCode());
        room.setRoomName(request.getRoomName());
        room.setLocation(request.getLocation());
        room.setCapacity(request.getCapacity());
        room.setDeviceJson(request.getDeviceJson());
        room.setRoomStatus(request.getRoomStatus());
        room.setManagerUserId(request.getManagerUserId());
        room.setRemark(request.getRemark());
    }
}
