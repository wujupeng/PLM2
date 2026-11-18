package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 日程分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ScheduleQuery extends PageQuery {

    private String scheduleType;

    private Long ownerUserId;

    private String startDate;

    private String endDate;
}
