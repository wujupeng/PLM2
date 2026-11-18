package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * 包装箱保存请求（N8，DEV-089）。
 */
@Data
public class MfgPackageSaveRequest {

    /** 包装编号（可选，留空自动生成）。 */
    private String packageNo;

    /** 箱码/托盘码（可选，留空自动生成）。 */
    private String packageCode;

    /** 包装层级：INNER/OUTER/PALLET。 */
    private String packageLevel;

    /** 上级包装编号。 */
    private String parentPackageNo;

    /** 产品编码。 */
    private String productCode;

    /** 生产批次号。 */
    private String batchNo;

    /** 工单号。 */
    private String workOrderNo;

    /** 包装数量。 */
    private BigDecimal packageQty;

    /** 客户编码。 */
    private String customerCode;

    /** 操作人。 */
    private String operator;

    /** 箱内明细。 */
    private List<MfgPackageItemRequest> items;

    private String remark;

    /** 兼容 frontend：包装明细（与 items 等价）。 */
    private List<MfgPackageItemRequest> lines;
}
