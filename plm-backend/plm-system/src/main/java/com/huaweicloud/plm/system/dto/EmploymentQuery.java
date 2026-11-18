package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class EmploymentQuery extends PageQuery {

    private Long orgId;

    private Long positionId;

    private String employmentStatus;
}
