package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 工艺资源—工序报工（对应 G3-N7b ERP 工艺资源—工序报工）：
 * 登记报工单号、计划/生产订单、物料与工序、合格/不合格/报废数量及报工信息，
 * 支撑工序报工追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_process_report")
public class ErpProcessReport extends BaseEntity {

    /** 报工单号（唯一，为空时自动生成）。 */
    private String reportNo;

    /** 计划单号。 */
    private String planNo;

    /** 生产订单号。 */
    private String productionOrderNo;

    /** 物料编码。 */
    private String materialCode;

    /** 工序号。 */
    private Integer operationNo;

    /** 合格数量，默认 0。 */
    private BigDecimal qualifiedQty;

    /** 不合格数量，默认 0。 */
    private BigDecimal unqualifiedQty;

    /** 报废数量，默认 0。 */
    private BigDecimal scrapQty;

    /** 报工人。 */
    private String reporter;

    /** 报工时间。 */
    private LocalDateTime reportTime;

    /** 报工状态，默认 SUBMITTED。 */
    private String reportStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
