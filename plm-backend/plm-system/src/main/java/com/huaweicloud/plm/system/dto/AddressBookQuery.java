package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 通讯录分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class AddressBookQuery extends PageQuery {

    private Long orgId;
}
