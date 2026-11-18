package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 委外发料单行保存请求（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）。
 * 发料单ID与发料单号由服务端赋值，不在请求中提供。
 */
@Data
public class ErpOutsourceIssueLineSaveRequest {

    /** 行号，为空时自动取当前最大行号 +1。 */
    private Integer lineNo;

    /** 关联委外订单号。 */
    private String orderNo;

    /** 关联委外订单行号。 */
    private Integer orderLineNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，为空默认 PCS。 */
    private String uom;

    /** 发料数量，为空默认 0。 */
    private BigDecimal issueQty;

    /** 批次号。 */
    private String batchNo;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 备注。 */
    private String remark;
}
