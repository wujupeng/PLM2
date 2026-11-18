package com.huaweicloud.plm.system.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

/**
 * 用车申请保存入参。
 */
@Data
public class HrVehicleApplySaveRequest {

    private Long vehicleId;

    private Long driverUserId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String destination;

    private String purpose;

    private Integer passengerCount;

    private BigDecimal mileage;

    private BigDecimal costAmount;

    private String remark;

    private Boolean submit;
}
