package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 末件检验单保存请求。
 */
@Data
public class MesLastInspectionSaveRequest {

    /** 末件检验单号（为空时自动生成）。 */
    private String lastNo;

    /** 工单号。 */
    private String workOrderNo;

    /** 派工单号。 */
    private String dispatchNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 工序编码。 */
    private String processCode;

    /** 工序名称。 */
    private String processName;

    /** 设备编码。 */
    private String equipmentCode;

    /** 批次号。 */
    private String batchNo;

    /** 检验项目。 */
    private String inspectionItem;

    /** 检验结果。 */
    private String inspectionResult;

    /** 检验状态，为空默认 PENDING。 */
    private String inspectionStatus;

    /** 检验员。 */
    private String inspector;

    /** 检验时间。 */
    private LocalDateTime inspectionTime;

    /** 判定单号。 */
    private String judgeNo;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
