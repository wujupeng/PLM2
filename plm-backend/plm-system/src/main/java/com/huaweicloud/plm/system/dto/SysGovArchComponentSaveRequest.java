package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 架构组件保存请求（G1-N7 WBS T005 总体架构）。
 */
@Data
public class SysGovArchComponentSaveRequest {

    /** 组件编号（为空时自动生成）。 */
    private String componentNo;

    /** 组件编码。 */
    private String componentCode;

    /** 组件名称。 */
    @NotBlank(message = "组件名称不能为空")
    private String componentName;

    /** 架构分层：APPLICATION/DATA/TECHNOLOGY/SECURITY 等，为空默认 APPLICATION。 */
    private String archLayer;

    /** 系统域。 */
    private String systemDomain;

    /** 组件类型。 */
    private String componentType;

    /** 技术栈。 */
    private String techStack;

    /** 部署单元。 */
    private String deployUnit;

    /** 组件状态，为空默认 ACTIVE。 */
    private String componentStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
