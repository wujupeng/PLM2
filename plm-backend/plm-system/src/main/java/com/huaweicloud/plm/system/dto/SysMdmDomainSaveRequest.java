package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 主数据域保存请求（G1-N8 公共平台底座 T007 主数据平台）。
 */
@Data
public class SysMdmDomainSaveRequest {

    /** 主数据域编号（为空时自动生成）。 */
    private String domainNo;

    /** 主数据域编码。 */
    @NotBlank(message = "主数据域编码不能为空")
    private String domainCode;

    /** 主数据域名称。 */
    @NotBlank(message = "主数据域名称不能为空")
    private String domainName;

    /** 主数据类型，为空默认 MATERIAL。 */
    private String masterType;

    /** 权威源系统，为空默认 PLM。 */
    private String authoritySystem;

    /** 责任部门。 */
    private String ownerDept;

    /** 同步方式，为空默认 PUSH。 */
    private String syncMode;

    /** 域状态，为空默认 ACTIVE。 */
    private String domainStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
