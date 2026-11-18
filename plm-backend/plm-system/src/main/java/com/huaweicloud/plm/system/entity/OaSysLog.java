package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 日志中心（OA-DEV-085）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_sys_log")
public class OaSysLog extends BaseEntity {

    /** 日志类型：OPERATION/LOGIN/SYSTEM/ERROR 等。 */
    private String logType;

    /** 日志级别：DEBUG/INFO/WARN/ERROR 等。 */
    private String logLevel;

    /** 日志模块。 */
    private String logModule;

    /** 日志标题。 */
    private String logTitle;

    /** 日志内容。 */
    private String logContent;

    /** 业务类型。 */
    private String bizType;

    /** 业务ID。 */
    private String bizId;

    /** 请求URI。 */
    private String requestUri;

    /** HTTP方法。 */
    private String httpMethod;

    /** 操作人用户ID。 */
    private Long operatorUserId;

    /** 操作人姓名。 */
    private String operatorName;

    /** IP地址。 */
    private String ipAddress;

    /** 用户代理。 */
    private String userAgent;

    /** 错误堆栈。 */
    private String errorStack;

    /** 告警标记：0 否，1 是。 */
    private Integer alertFlag;

    /** 告警状态：NONE/PENDING/HANDLED 等。 */
    private String alertStatus;

    /** 处理备注。 */
    private String handleRemark;

    /** 耗时（毫秒）。 */
    private Integer costMs;

    /** 日志时间。 */
    private LocalDateTime logTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
