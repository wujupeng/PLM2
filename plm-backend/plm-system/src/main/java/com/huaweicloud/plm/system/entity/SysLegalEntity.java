package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 法人主体（G1-N5 公共平台底座—多组织多工厂 WBS T100）：
 * 承载财务与税务主体，登记统一社会信用代码、税号与本位币，供各业务系统按法人维度隔离与汇总。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_legal_entity")
public class SysLegalEntity extends BaseEntity {

    /** 法人编码（唯一，支持人工指定）。 */
    private String legalCode;

    /** 法人名称。 */
    private String legalName;

    /** 统一社会信用代码。 */
    private String unifiedSocialCode;

    /** 税号。 */
    private String taxNo;

    /** 法定代表人。 */
    private String legalRep;

    /** 本位币。 */
    private String baseCurrency;

    /** 国家。 */
    private String country;

    /** 地区。 */
    private String region;

    /** 地址。 */
    private String address;

    /** 联系电话。 */
    private String contactPhone;

    /** 法人状态：ACTIVE/DISABLED。 */
    private String legalStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
