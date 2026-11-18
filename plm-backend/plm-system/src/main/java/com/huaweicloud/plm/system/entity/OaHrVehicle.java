package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 车辆档案：公司公务车辆基础信息。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_hr_vehicle")
public class OaHrVehicle extends BaseEntity {

    private String vehicleCode;

    private String plateNo;

    /** 车辆类型：可配置字典，默认 SEDAN。 */
    private String vehicleType;

    private String brandModel;

    private Integer seatCount;

    private Long driverUserId;

    private String driverName;

    /** 车辆状态：IDLE/IN_USE/MAINTENANCE/DISABLED。 */
    private String vehicleStatus;

    private String remark;
}
