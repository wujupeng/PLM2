package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 库存盘点头保存请求（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 */
@Data
public class ErpInventoryCountSaveRequest {

    /** 盘点单号（为空时自动生成）。 */
    private String countNo;

    /** 盘点类型，为空默认 FULL。 */
    private String countType;

    /** 盘点仓库编码。 */
    private String warehouseCode;

    /** 盘点仓库名称。 */
    private String warehouseName;

    /** 经办人。 */
    private String countBy;

    /** 盘点日期。 */
    private LocalDateTime countDate;

    /** 合计差异数量，为空默认 0。 */
    private BigDecimal totalDiffQty;

    /** 盘点状态，为空默认 DRAFT。 */
    private String countStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
