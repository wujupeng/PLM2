package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 销售管理—销售出库（G3-N2 ERP 销售管理）：
 * 记录销售发货对应的出库单，含出库数量、批次与操作人等信息。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_sales_outbound")
public class ErpSalesOutbound extends BaseEntity {

    /** 出库单号（唯一，支持人工指定，为空时自动生成）。 */
    private String outboundNo;

    /** 关联发货单号。 */
    private String deliveryNo;

    /** 来源销售订单号。 */
    private String orderNo;

    /** 客户编码。 */
    private String customerCode;

    /** 出库仓库编码。 */
    private String warehouseCode;

    /** 出库日期。 */
    private LocalDateTime outboundDate;

    /** 出库数量，默认 0。 */
    private BigDecimal outboundQty;

    /** 批次号。 */
    private String batchNo;

    /** 操作人。 */
    private String operatorName;

    /** 出库状态，默认 DRAFT。 */
    private String outboundStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
