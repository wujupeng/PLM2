package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 车辆信息保存入参。
 */
@Data
public class HrVehicleSaveRequest {

    private String vehicleCode;

    private String plateNo;

    private String vehicleType;

    private String brandModel;

    private Integer seatCount;

    private Long driverUserId;

    private String vehicleStatus;

    private String remark;
}
