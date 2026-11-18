package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class DelegationQuery extends PageQuery {

    private Long delegatorUserId;

    private Long delegateUserId;

    private String delegationStatus;
}
