package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 在制品看板记录保存请求。
 */
@Data
public class MesKanbanWipSaveRequest {

    /** 在制品单号（为空时自动生成）。 */
    private String wipNo;

    /** 工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 产线编码。 */
    private String lineCode;

    /** 工序编码。 */
    private String processCode;

    /** 在制数量。 */
    private BigDecimal wipQty;

    /** 计量单位。 */
    private String uom;

    /** 统计时间。 */
    private LocalDateTime statTime;

    /** 记录状态，为空默认 DRAFT。 */
    private String recordStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
