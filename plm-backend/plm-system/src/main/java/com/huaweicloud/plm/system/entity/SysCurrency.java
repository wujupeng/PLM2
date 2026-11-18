package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 币种（G1-N5 公共平台底座—多币种多税率 WBS T101）：
 * 登记 ISO 币种编码、符号与金额精度，本位币由 base_flag 唯一标识，
 * 供各业务系统统一做多币种金额登记与换算。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_currency")
public class SysCurrency extends BaseEntity {

    /** 币种编码（唯一，支持人工指定）。 */
    private String currencyCode;

    /** 币种名称。 */
    private String currencyName;

    /** 币种符号。 */
    private String currencySymbol;

    /** 金额精度（小数位）。 */
    private Integer currencyPrecision;

    /** 本位币标识：1 本位币，0 非本位币。 */
    private Integer baseFlag;

    /** 适用国家。 */
    private String country;

    /** 币种状态：ACTIVE/DISABLED。 */
    private String currencyStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
