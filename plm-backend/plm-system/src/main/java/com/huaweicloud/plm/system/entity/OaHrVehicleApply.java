package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 用车申请单：公务用车申请与派车记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_hr_vehicle_apply")
public class OaHrVehicleApply extends BaseEntity {

    private String applyNo;

    private Long applicantUserId;

    private String applicantName;

    private Long orgId;

    private String orgName;

    private Long vehicleId;

    private String plateNo;

    private Long driverUserId;

    private String driverName;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String destination;

    private String purpose;

    private Integer passengerCount;

    private BigDecimal mileage;

    private BigDecimal costAmount;

    /** 流程状态：DRAFT/RUNNING/APPROVED/REJECTED/CANCELLED。 */
    private String flowStatus;

    private Long instanceId;

    private String instanceNo;

    private Integer cancelFlag;

    private String remark;
}
