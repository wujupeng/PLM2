package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 会议室分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MeetingRoomQuery extends PageQuery {

    private String roomStatus;
}
