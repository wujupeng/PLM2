package com.huaweicloud.plm.system.dto;

import java.math.BigDecimal;
import lombok.Data;

/**
 * 设备维修工单处理入参（OA-DEV-078）。
 */
@Data
public class BizAssetRepairHandleRequest {

    private String faultCause;

    private String repairMeasure;

    private String spareParts;

    private BigDecimal workHours;

    private BigDecimal repairCost;

    private Integer downtimeMinutes;

    /** 是否重复故障。 */
    private Boolean repeatFlag;
}
