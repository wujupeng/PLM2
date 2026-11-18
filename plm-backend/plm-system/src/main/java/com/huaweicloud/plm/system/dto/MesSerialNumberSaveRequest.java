package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 序列号台账保存请求。
 */
@Data
public class MesSerialNumberSaveRequest {

    /** 序列号（为空时自动生成）。 */
    private String serialNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 批次号。 */
    private String batchNo;

    /** 序列号状态，为空默认 CREATED。 */
    private String serialStatus;

    /** 工单号。 */
    private String workOrderNo;

    /** 生产时间。 */
    private LocalDateTime produceTime;

    /** 发货时间。 */
    private LocalDateTime shipTime;

    /** 客户编码。 */
    private String customerCode;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
