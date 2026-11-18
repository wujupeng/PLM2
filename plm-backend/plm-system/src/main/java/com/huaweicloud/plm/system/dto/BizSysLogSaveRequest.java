package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 系统日志保存入参（OA-DEV-085）。
 */
@Data
public class BizSysLogSaveRequest {

    /** 日志类型：可配置字典 oa_log_type。 */
    private String logType;

    /** 日志级别：可配置字典 oa_log_level。 */
    private String logLevel;

    private String logModule;

    private String logTitle;

    private String logContent;

    private String bizType;

    private String bizId;

    /** 是否触发告警。 */
    private Boolean alertFlag;

    private String remark;
}
