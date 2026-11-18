package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 协同任务分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class CollabTaskQuery extends PageQuery {

    private String taskStatus;

    private Long ownerUserId;
}
