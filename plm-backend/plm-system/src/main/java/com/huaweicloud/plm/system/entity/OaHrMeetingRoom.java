package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 会议室：会议室基础信息与设备配置。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_hr_meeting_room")
public class OaHrMeetingRoom extends BaseEntity {

    private String roomCode;

    private String roomName;

    private String location;

    private Integer capacity;

    private String deviceJson;

    /** 会议室状态：ENABLED/DISABLED。 */
    private String roomStatus;

    private Long managerUserId;

    private String managerName;

    private String remark;
}
