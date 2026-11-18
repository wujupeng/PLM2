package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 编码规则分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class CodeRuleQuery extends PageQuery {

    /** 编码类型：CODE14/CODE24/CODE28。 */
    private String codeType;

    /** 状态：draft/enabled/disabled。 */
    private String status;

    /** 适用客户编码。 */
    private String customerCode;

    /** 适用工厂编码。 */
    private String plantCode;

    /** 是否默认规则：0 否 / 1 是。 */
    private Integer isDefault;
}
