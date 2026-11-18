package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 环境保存请求（G1-N7 WBS T012）。
 */
@Data
public class DevopsEnvironmentSaveRequest {

    /** 环境编号（为空时自动生成）。 */
    private String envNo;

    /** 环境编码（必填且唯一）。 */
    @NotBlank(message = "环境编码不能为空")
    private String envCode;

    /** 环境名称。 */
    @NotBlank(message = "环境名称不能为空")
    private String envName;

    /** 环境类型，为空默认 DEV。 */
    private String envType;

    /** 部署目标。 */
    private String deployTarget;

    /** 是否隔离：1 隔离/0 不隔离，为空默认 1。 */
    private Integer isolated;

    /** 负责人。 */
    private String ownerName;

    /** 环境状态，为空默认 ACTIVE。 */
    private String envStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
