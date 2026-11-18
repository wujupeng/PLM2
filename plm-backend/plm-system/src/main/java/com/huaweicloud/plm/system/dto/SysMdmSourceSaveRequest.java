package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 权威源登记保存请求（G1-N8 公共平台底座 T007 主数据平台）。
 */
@Data
public class SysMdmSourceSaveRequest {

    /** 权威源编号（为空时自动生成）。 */
    private String sourceNo;

    /** 主数据域编码。 */
    @NotBlank(message = "主数据域编码不能为空")
    private String domainCode;

    /** 源系统。 */
    @NotBlank(message = "源系统不能为空")
    private String sourceSystem;

    /** 源实体。 */
    private String sourceEntity;

    /** 权威级别，为空默认 PRIMARY。 */
    private String authorityLevel;

    /** 同步方向，为空默认 OUT。 */
    private String syncDirection;

    /** 源状态，为空默认 ACTIVE。 */
    private String sourceStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
