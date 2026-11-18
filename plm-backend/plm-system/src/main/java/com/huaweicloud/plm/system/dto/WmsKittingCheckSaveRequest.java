package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 齐套检查保存请求。
 */
@Data
public class WmsKittingCheckSaveRequest {

    /** 齐套检查单号（为空时自动生成）。 */
    private String checkNo;

    /** 生产工单号。 */
    @NotBlank(message = "生产工单号不能为空")
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

    /** 齐套状态，为空默认 PENDING。 */
    private String kitStatus;

    /** 检查人。 */
    private String checkBy;

    /** 检查时间。 */
    private LocalDateTime checkTime;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String description;

    /** 备注。 */
    private String remark;
}
