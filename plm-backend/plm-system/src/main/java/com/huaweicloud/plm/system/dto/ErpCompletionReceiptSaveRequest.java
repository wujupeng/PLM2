package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 完工入库单保存请求（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）。
 */
@Data
public class ErpCompletionReceiptSaveRequest {

    /** 完工入库单号（为空时自动生成）。 */
    private String receiptNo;

    /** 生产订单号。 */
    private String orderNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，为空默认 PCS。 */
    private String uom;

    /** 完工数量，为空默认 0。 */
    private BigDecimal completedQty;

    /** 报废数量，为空默认 0。 */
    private BigDecimal scrapQty;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 入库日期。 */
    private LocalDateTime receiptDate;

    /** 是否报检，为空默认 0。 */
    private Integer inspectionRequired;

    /** 检验状态，为空默认 PENDING。 */
    private String inspectionStatus;

    /** 入库状态，为空默认 DRAFT。 */
    private String receiptStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
