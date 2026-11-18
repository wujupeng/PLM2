package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * API 访问审计记录（OA-DEV-086）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_api_access_log")
public class OaApiAccessLog extends BaseEntity {

    /** 全链路追踪ID。 */
    private String traceId;

    /** 请求路径。 */
    private String path;

    /** HTTP 方法。 */
    private String httpMethod;

    /** 客户端系统：PLM/ERP/MES/QMS/EDI/OTHER。 */
    private String clientSystem;

    /** 应用 Key。 */
    private String appKey;

    /** 操作人用户ID。 */
    private Long operatorUserId;

    /** 操作人姓名。 */
    private String operatorName;

    /** 客户端 IP。 */
    private String ipAddress;

    /** HTTP 状态码。 */
    private Integer statusCode;

    /** 业务结果码。 */
    private String resultCode;

    /** 耗时（毫秒）。 */
    private Integer costMs;

    /** 请求摘要。 */
    private String requestSummary;

    /** 错误信息。 */
    private String errorMsg;

    /** 访问时间。 */
    private LocalDateTime accessTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
