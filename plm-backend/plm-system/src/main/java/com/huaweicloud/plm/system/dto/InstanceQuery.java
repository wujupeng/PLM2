package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class InstanceQuery extends PageQuery {

    private Long processId;

    private Long applicantUserId;

    private String instanceStatus;

    private String category;
}
