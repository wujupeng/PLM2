package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 首件确认保存请求。
 */
@Data
public class MesFaiSaveRequest {

    /** 首件确认单号（为空时自动生成）。 */
    private String faiNo;

    /** 工单号。 */
    private String workOrderNo;

    /** 工序编码。 */
    private String processCode;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 设备编码。 */
    private String equipmentCode;

    /** 检验人。 */
    private String inspector;

    /** 检验时间。 */
    private LocalDateTime inspectTime;

    /** 首件结果，为空默认 PASS。 */
    private String faiResult;

    /** 首件状态，为空默认 PENDING。 */
    private String faiStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
