package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 会议室预定分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MeetingBookingQuery extends PageQuery {

    private Long roomId;

    private String bookingStatus;

    private Long organizerUserId;

    private String startDate;

    private String endDate;
}
