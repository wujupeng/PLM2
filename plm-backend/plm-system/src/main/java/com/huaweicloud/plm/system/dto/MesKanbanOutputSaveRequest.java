package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 产量看板记录保存请求。
 */
@Data
public class MesKanbanOutputSaveRequest {

    /** 产量看板单号（为空时自动生成）。 */
    private String outputNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 产线编码。 */
    private String lineCode;

    /** 班次编码。 */
    private String shiftCode;

    /** 产量。 */
    private BigDecimal outputQty;

    /** 合格数量。 */
    private BigDecimal qualifiedQty;

    /** 不合格数量。 */
    private BigDecimal unqualifiedQty;

    /** 计量单位。 */
    private String uom;

    /** 产出日期。 */
    private LocalDateTime outputDate;

    /** 记录状态，为空默认 DRAFT。 */
    private String recordStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
