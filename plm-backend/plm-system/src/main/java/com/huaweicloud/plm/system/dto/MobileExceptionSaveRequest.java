package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 移动异常保存请求（G1-N6 WBS T106 移动端与PDA）。
 */
@Data
public class MobileExceptionSaveRequest {

    /** 异常编号（为空时自动生成）。 */
    private String exceptionNo;

    /** 场景编码。 */
    private String sceneCode;

    /** 条码。 */
    private String barcode;

    /** 异常类型：SCAN_FAIL/LABEL_INVALID/OFFLINE_SYNC/PERMISSION/DATA_MISMATCH，为空默认 SCAN_FAIL。 */
    private String errorType;

    /** 异常信息。 */
    private String errorMessage;

    /** 处理状态：OPEN/HANDLING/RESOLVED/IGNORED，为空默认 OPEN。 */
    private String exceptionStatus;

    /** 处理人。 */
    private String handlerName;

    /** 处理时间。 */
    private LocalDateTime handledTime;

    /** 处理说明。 */
    private String handleNote;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
