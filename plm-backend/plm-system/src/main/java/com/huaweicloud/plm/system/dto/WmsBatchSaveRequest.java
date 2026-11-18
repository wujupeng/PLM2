package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 物料批次保存请求（N7，DEV-075）。
 */
@Data
public class WmsBatchSaveRequest {

    @NotBlank(message = "批次号不能为空")
    private String batchNo;

    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 所在库位。 */
    private String locationCode;

    /** 容器编码/箱码。 */
    private String containerCode;

    /** 供应商编码。 */
    private String supplierCode;

    /** 在库数量。 */
    private BigDecimal qtyOnHand;

    /** 单位。 */
    private String unit;

    /** 入库日期。 */
    private LocalDate inboundDate;

    /** 检验放行日期。 */
    private LocalDate releaseDate;

    /** 批次生产日期。 */
    private LocalDate productionDate;

    /** 有效期至。 */
    private LocalDate expiryDate;

    /** 检验状态：PENDING/RELEASED/REJECTED。 */
    private String inspectionStatus;

    /** 批次状态：IN_STOCK/CONSUMED/RETURNED/SCRAPPED/EXPIRED。 */
    private String batchStatus;

    /** 关联工单。 */
    private String workOrderNo;

    private String remark;
}
