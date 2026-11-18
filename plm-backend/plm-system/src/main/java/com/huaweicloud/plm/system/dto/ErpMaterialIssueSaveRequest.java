package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 材料领用单头保存请求（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）。
 */
@Data
public class ErpMaterialIssueSaveRequest {

    /** 领料单号（为空时自动生成）。 */
    private String issueNo;

    /** 生产订单号。 */
    private String orderNo;

    /** 车间。 */
    private String workshop;

    /** 领料人。 */
    private String issueBy;

    /** 领料日期。 */
    private LocalDateTime issueDate;

    /** 领料总数量，为空默认 0。 */
    private BigDecimal totalQty;

    /** 领料状态，为空默认 DRAFT。 */
    private String issueStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
