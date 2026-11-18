package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * API 访问审计记录登记入参（OA-DEV-086）。
 */
@Data
public class BizApiAccessLogSaveRequest {

    private String traceId;

    private String path;

    private String httpMethod;

    /** 客户端系统：PLM/ERP/MES/QMS/EDI/OTHER。 */
    private String clientSystem;

    private String appKey;

    private Long operatorUserId;

    private String operatorName;

    private String ipAddress;

    private Integer statusCode;

    private String resultCode;

    private Integer costMs;

    private String requestSummary;

    private String errorMsg;

    private String remark;
}
