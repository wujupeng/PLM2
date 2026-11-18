package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 工序报工保存请求（对应 G3-N7b ERP 工艺资源—工序报工）。
 */
@Data
public class ErpProcessReportSaveRequest {

    /** 报工单号（为空时自动生成）。 */
    private String reportNo;

    /** 计划单号。 */
    private String planNo;

    /** 生产订单号。 */
    private String productionOrderNo;

    /** 物料编码。 */
    private String materialCode;

    /** 工序号。 */
    private Integer operationNo;

    /** 合格数量，为空默认 0。 */
    private BigDecimal qualifiedQty;

    /** 不合格数量，为空默认 0。 */
    private BigDecimal unqualifiedQty;

    /** 报废数量，为空默认 0。 */
    private BigDecimal scrapQty;

    /** 报工人。 */
    private String reporter;

    /** 报工时间。 */
    private LocalDateTime reportTime;

    /** 报工状态，为空默认 SUBMITTED。 */
    private String reportStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
