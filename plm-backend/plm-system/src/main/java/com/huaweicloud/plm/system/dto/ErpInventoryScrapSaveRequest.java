package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 库存报废单保存请求（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 */
@Data
public class ErpInventoryScrapSaveRequest {

    /** 报废单号（为空时自动生成）。 */
    private String scrapNo;

    /** 报废类型，为空默认 NORMAL。 */
    private String scrapType;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 计量单位，为空默认 PCS。 */
    private String uom;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库位编码，为空默认空字符串。 */
    private String locationCode;

    /** 批次号，为空默认空字符串。 */
    private String batchNo;

    /** 报废数量，为空默认 0。 */
    private BigDecimal scrapQty;

    /** 报废原因。 */
    private String scrapReason;

    /** 报废人。 */
    private String scrapBy;

    /** 报废日期。 */
    private LocalDateTime scrapDate;

    /** 报废状态，为空默认 DRAFT。 */
    private String scrapStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
