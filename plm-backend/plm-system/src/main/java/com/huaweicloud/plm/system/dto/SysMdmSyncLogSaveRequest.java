package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 主数据同步日志保存请求（G1-N8 主数据平台 T007 同步日志）。
 */
@Data
public class SysMdmSyncLogSaveRequest {

    /** 同步日志编号（为空时自动生成）。 */
    private String logNo;

    /** 主数据域编码。 */
    @NotBlank(message = "主数据域编码不能为空")
    private String domainCode;

    /** 源系统。 */
    private String sourceSystem;

    /** 目标系统。 */
    private String targetSystem;

    /** 主数据编码。 */
    private String masterCode;

    /** 同步状态，为空默认 SUCCESS。 */
    private String syncStatus;

    /** 同步时间，为空时取当前时间。 */
    private LocalDateTime syncTime;

    /** 同步信息。 */
    private String message;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
