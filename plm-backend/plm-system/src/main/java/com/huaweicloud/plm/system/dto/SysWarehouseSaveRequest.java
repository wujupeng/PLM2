package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 仓库保存请求（G1-N5 公共平台底座—多组织多工厂 WBS T100）。
 */
@Data
public class SysWarehouseSaveRequest {

    /** 仓库编码（为空时自动生成）。 */
    private String warehouseCode;

    /** 仓库名称。 */
    @NotBlank(message = "仓库名称不能为空")
    private String warehouseName;

    /** 所属工厂编码。 */
    private String factoryCode;

    /** 仓库类型：RAW/SEMI/FINISHED/SPARE/INTRANSIT。 */
    private String warehouseType;

    /** 库位。 */
    private String location;

    /** 容量。 */
    private Long capacity;

    /** 负责人。 */
    private String manager;

    /** 仓库状态：ACTIVE/DISABLED。 */
    private String warehouseStatus;

    /** 描述。 */
    private String description;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
