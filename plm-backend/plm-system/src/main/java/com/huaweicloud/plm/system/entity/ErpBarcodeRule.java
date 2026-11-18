package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * ERP 条码管理—扫码规则（对应 G3-N7a ERP 条码管理）：
 * 维护扫码规则编码、名称、条码类型与校验/查重开关，支撑扫码解析与校验。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_barcode_rule")
public class ErpBarcodeRule extends BaseEntity {

    /** 规则编码（唯一）。 */
    private String ruleCode;

    /** 规则名称。 */
    private String ruleName;

    /** 条码类型，默认 MATERIAL。 */
    private String barcodeType;

    /** 规则表达式。 */
    private String rulePattern;

    /** 扫码业务类型，默认 RECEIPT。 */
    private String scanBizType;

    /** 是否启用校验，0=否，默认 1。 */
    private Integer validateEnabled;

    /** 是否查重，0=否，默认 1。 */
    private Integer duplicateCheck;

    /** 规则状态，默认 ACTIVE。 */
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
