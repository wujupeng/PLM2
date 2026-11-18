package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * 发货放行请求（N8，DEV-092）。
 */
@Data
public class MfgShipReleaseRequest {

    /** 承运商。 */
    private String carrier;

    /** 车牌号。 */
    private String vehicleNo;

    /** 司机。 */
    private String driver;

    /** 司机电话。 */
    private String driverPhone;

    /** 发货日期。 */
    private LocalDate shipDate;

    /** 是否同时发送 ASN 给客户（默认按配置）。 */
    private Boolean sendAsn;

    /** 放行意见。 */
    private String remark;
}
