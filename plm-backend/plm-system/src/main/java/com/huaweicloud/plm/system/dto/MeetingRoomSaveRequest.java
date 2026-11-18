package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 会议室信息保存入参。
 */
@Data
public class MeetingRoomSaveRequest {

    private String roomCode;

    private String roomName;

    private String location;

    private Integer capacity;

    private String deviceJson;

    private String roomStatus;

    private Long managerUserId;

    private String remark;
}
