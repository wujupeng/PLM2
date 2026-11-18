package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 库区保存请求（对应库区）。
 */
@Data
public class WmsZoneSaveRequest {

    /** 库区编码（为空时自动生成）。 */
    @NotBlank(message = "库区编码不能为空")
    private String zoneCode;

    /** 库区名称。 */
    private String zoneName;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 仓库名称。 */
    private String warehouseName;

    /** 库区类型，为空默认 STORAGE。 */
    private String zoneType;

    /** 温层类型，为空默认 NORMAL。 */
    private String temperatureType;

    /** 库区状态，为空默认 DRAFT。 */
    private String zoneStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
