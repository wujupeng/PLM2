package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * SRM 异常补偿记录：登记 PLM→SRM 集成过程中出现异常需人工补偿处理的对象。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("intg_erp_srm_compensation")
public class IntgErpSrmCompensation extends BaseEntity {

    /** 补偿编号（唯一，为空时自动生成）。 */
    private String compensationNo;

    /** 批次号。 */
    private String batchNo;

    /** 接口编号。 */
    private String interfaceNo;

    /** 集成对象类型，默认 PURCHASE_REQUIREMENT。 */
    private String objectType;

    /** 对象编号。 */
    private String objectNo;

    /** 错误类型，默认 VALIDATION。 */
    private String errorType;

    /** 错误信息。 */
    private String errorMessage;

    /** 重试次数，默认 0。 */
    private Integer retryCount;

    /** 处理人。 */
    private String handler;

    /** 处理时间。 */
    private LocalDateTime handleTime;

    /** 补偿状态，默认 PENDING。 */
    private String compensationStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
