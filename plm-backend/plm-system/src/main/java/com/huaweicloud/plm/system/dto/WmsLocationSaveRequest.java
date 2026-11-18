package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 库位保存请求（N7，DEV-075）。
 */
@Data
public class WmsLocationSaveRequest {

    @NotBlank(message = "库位编码不能为空")
    private String locationCode;

    @NotBlank(message = "库位名称不能为空")
    private String locationName;

    /** 库位类型：RACK/STORAGE/STAGING/LINE_SIDE/RECEIVING。 */
    private String locationType;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库区编码。 */
    private String areaCode;

    /** 货架编码。 */
    private String rackCode;

    /** 层编码。 */
    private String levelCode;

    /** 格口编码。 */
    private String binCode;

    /** 关联产线（线边库位）。 */
    private String lineCode;

    /** 容量。 */
    private BigDecimal capacity;

    /** 状态：enabled/disabled。 */
    private String status;

    private String remark;
}
