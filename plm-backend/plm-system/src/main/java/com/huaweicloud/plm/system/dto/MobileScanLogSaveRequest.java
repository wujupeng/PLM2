package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 扫码操作日志保存请求（G1-N6 WBS T106 移动端与PDA）。
 */
@Data
public class MobileScanLogSaveRequest {

    /** 日志编号（为空时自动生成）。 */
    private String logNo;

    /** 场景编码。 */
    private String sceneCode;

    /** 扫码类型。 */
    private String scanType;

    /** 条码。 */
    @NotBlank(message = "条码不能为空")
    private String barcode;

    /** 业务键。 */
    private String bizKey;

    /** 关联单据号。 */
    private String docNo;

    /** 操作人ID。 */
    private Long operatorId;

    /** 操作人名称。 */
    private String operatorName;

    /** 设备编号。 */
    private String deviceNo;

    /** 扫码时间。 */
    private LocalDateTime scanTime;

    /** 扫码结果：SUCCESS/FAIL，为空默认 SUCCESS。 */
    private String scanResult;

    /** 结果信息。 */
    private String message;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
