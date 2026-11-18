package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 资源资料保存请求（对应 G3-N7b ERP 工艺资源）。
 */
@Data
public class ErpProcessResourceSaveRequest {

    /** 资源编码（用户指定）。 */
    @NotBlank(message = "资源编码不能为空")
    private String resourceCode;

    /** 资源名称。 */
    private String resourceName;

    /** 资源类型，为空默认 MACHINE。 */
    private String resourceType;

    /** 规格型号。 */
    private String spec;

    /** 资源分组。 */
    private String resourceGroup;

    /** 工作中心。 */
    private String workCenter;

    /** 产能，为空默认 0。 */
    private BigDecimal capacity;

    /** 产能单位。 */
    private String capacityUnit;

    /** 计量单位。 */
    private String uom;

    /** 资源状态，为空默认 ACTIVE。 */
    private String resourceStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
