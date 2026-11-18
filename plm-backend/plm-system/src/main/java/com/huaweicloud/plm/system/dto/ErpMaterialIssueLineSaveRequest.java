package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 材料领用单行保存请求（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）。
 * 领料单ID与领料单号由服务端赋值，不在请求中提供。
 */
@Data
public class ErpMaterialIssueLineSaveRequest {

    /** 行号，为空时自动取当前最大行号 +1。 */
    private Integer lineNo;

    /** 行状态，为空默认 OPEN。 */
    private String lineStatus;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，为空默认 PCS。 */
    private String uom;

    /** 领用数量，为空默认 0。 */
    private BigDecimal issueQty;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 备注。 */
    private String remark;
}
