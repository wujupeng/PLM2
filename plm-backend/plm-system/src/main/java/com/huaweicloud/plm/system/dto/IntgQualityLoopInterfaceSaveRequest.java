package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 集成接口定义保存请求。
 */
@Data
public class IntgQualityLoopInterfaceSaveRequest {

    /** 接口编号（为空时自动生成）。 */
    private String interfaceNo;

    /** 接口名称。 */
    @NotBlank(message = "接口名称不能为空")
    private String interfaceName;

    /** 集成方向。 */
    private String direction;

    /** 集成对象类型。 */
    private String objectType;

    /** 接口协议。 */
    private String protocol;

    /** 接口端点地址。 */
    private String endpoint;

    /** 触发方式。 */
    private String triggerType;

    /** 同步模式。 */
    private String syncMode;

    /** 接口状态。 */
    private String interfaceStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
