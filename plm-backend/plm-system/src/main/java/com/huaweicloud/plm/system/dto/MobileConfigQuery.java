package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 移动端配置分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MobileConfigQuery extends PageQuery {

    private String configType;

    private String configStatus;
}
