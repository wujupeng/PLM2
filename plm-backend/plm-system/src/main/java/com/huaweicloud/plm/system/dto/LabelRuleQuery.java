package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 标签校验规则分页查询条件（G1-N6 WBS T106 移动端与PDA）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class LabelRuleQuery extends PageQuery {

    /** 标签类型：MATERIAL/PRODUCT/BOX/WAREHOUSE。 */
    private String labelType;

    /** 校验类型：FORMAT/CHECKSUM/LENGTH/PREFIX。 */
    private String checkType;

    /** 规则状态：ACTIVE/DISABLED。 */
    private String ruleStatus;
}
