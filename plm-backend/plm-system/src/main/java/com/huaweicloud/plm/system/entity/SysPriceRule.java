package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 含税/未税价格规则（G1-N5 公共平台底座—多币种多税率 WBS T101）：
 * 登记「价格口径 + 关联税率 + 舍入方式 + 金额精度」，供各业务系统统一做含税/未税换算，避免各系统自造换算公式。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_price_rule")
public class SysPriceRule extends BaseEntity {

    /** 规则编号（唯一，支持人工指定）。 */
    private String ruleNo;

    /** 规则编码。 */
    private String ruleCode;

    /** 规则名称。 */
    private String ruleName;

    /** 业务模块：PLM/ERP/SRM/MES/WMS/OA。 */
    private String bizModule;

    /** 价格口径：TAX_INCLUSIVE/TAX_EXCLUSIVE。 */
    private String priceMode;

    /** 关联税率编码。 */
    private String taxCode;

    /** 舍入方式：HALF_UP/HALF_EVEN/UP/DOWN。 */
    private String roundingMode;

    /** 金额精度（小数位）。 */
    private Integer precisionDigits;

    /** 规则状态：ACTIVE/DISABLED。 */
    private String ruleStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
