package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 齐套检查单。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_kitting_check")
public class WmsKittingCheck extends BaseEntity {

    /** 齐套检查单号。 */
    private String checkNo;

    /** 生产工单号。 */
    private String workOrderNo;

    /** 产品编码。 */
    private String productCode;

    /** 产品名称。 */
    private String productName;

    /** 计划数量。 */
    private BigDecimal planQty;

    /** 物料项总数。 */
    private Integer totalItems;

    /** 齐套项数。 */
    private Integer kitItems;

    /** 缺料项数。 */
    private Integer shortItems;

    /** 缺料数量。 */
    private BigDecimal shortQty;

    /** 齐套状态，默认 PENDING。 */
    private String kitStatus;

    /** 检查人。 */
    private String checkBy;

    /** 检查时间。 */
    private LocalDateTime checkTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
