package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 产线保存请求（G1-N5 公共平台底座—多组织多工厂 WBS T100）。
 */
@Data
public class SysProductionLineSaveRequest {

    /** 产线编码（为空时自动生成）。 */
    private String lineCode;

    /** 产线名称。 */
    @NotBlank(message = "产线名称不能为空")
    private String lineName;

    /** 所属工厂编码。 */
    private String factoryCode;

    /** 车间。 */
    private String workshop;

    /** 产线类型：ASSEMBLY/MACHINING/PACKAGING/TESTING。 */
    private String lineType;

    /** 小时产能。 */
    private Integer capacityPerHour;

    /** 负责人。 */
    private String manager;

    /** 产线状态：ACTIVE/DISABLED。 */
    private String lineStatus;

    /** 描述。 */
    private String description;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
