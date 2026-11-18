package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 采集数据点记录保存请求。
 */
@Data
public class MesCollectPointSaveRequest {

    /** 数据点编号（为空时自动生成）。 */
    private String pointNo;

    /** 数据点编码。 */
    @NotBlank(message = "数据点编码不能为空")
    private String pointCode;

    /** 数据点名称。 */
    private String pointName;

    /** 采集接口编号。 */
    private String interfaceNo;

    /** 设备编码。 */
    private String deviceCode;

    /** 点位地址。 */
    private String address;

    /** 数据类型，为空默认 NUMERIC。 */
    private String dataType;

    /** 计量单位。 */
    private String uom;

    /** 换算系数。 */
    private BigDecimal scaleFactor;

    /** 上限。 */
    private BigDecimal upperLimit;

    /** 下限。 */
    private BigDecimal lowerLimit;

    /** 数据点状态，为空默认 OFFLINE。 */
    private String pointStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
