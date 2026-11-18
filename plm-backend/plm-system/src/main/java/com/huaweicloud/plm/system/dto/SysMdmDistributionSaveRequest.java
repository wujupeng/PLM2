package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 主数据分发保存请求（G1-N8 公共平台底座 T007 主数据平台）。
 */
@Data
public class SysMdmDistributionSaveRequest {

    /** 分发编号（为空时自动生成）。 */
    private String distNo;

    /** 主数据域编码。 */
    @NotBlank(message = "主数据域编码不能为空")
    private String domainCode;

    /** 主数据编码。 */
    private String masterCode;

    /** 目标系统。 */
    @NotBlank(message = "目标系统不能为空")
    private String targetSystem;

    /** 分发类型，为空默认 FULL。 */
    private String distType;

    /** 分发状态，为空默认 PENDING。 */
    private String distStatus;

    /** 分发时间。 */
    private LocalDateTime distTime;

    /** 回执时间。 */
    private LocalDateTime ackTime;

    /** 重试次数，为空默认 0。 */
    private Integer retryCount;

    /** 分发消息。 */
    private String message;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
