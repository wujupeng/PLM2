package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * OA↔六系统接收回执记录：登记 系统对 OA 推送对象的校验回执。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("intg_oa_systems_receipt")
public class IntgOaSystemsReceipt extends BaseEntity {

    /** 回执编号（唯一，为空时自动生成）。 */
    private String receiptNo;

    /** 批次号。 */
    private String batchNo;

    /** 接口编号。 */
    private String interfaceNo;

    /** 集成对象类型，默认 UNIFIED_TODO。 */
    private String objectType;

    /** 对象编号。 */
    private String objectNo;

    /** 对象版本。 */
    private String objectVersion;

    /** 系统对象标识。 */
    private String systemObjectId;

    /** 回执状态，默认 PENDING。 */
    private String receiptStatus;

    /** 校验信息。 */
    private String checkMessage;

    /** 回执时间。 */
    private LocalDateTime receiptTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
