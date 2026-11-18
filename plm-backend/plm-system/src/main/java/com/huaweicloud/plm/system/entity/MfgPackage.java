package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 包装箱/托盘（N8，DEV-089）：箱码、托盘码、内外箱关系与包装数量。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mfg_package")
public class MfgPackage extends BaseEntity {

    /** 包装编号（唯一）。 */
    private String packageNo;

    /** 箱码/托盘码（唯一，可扫描）。 */
    private String packageCode;

    /** 包装层级：INNER/OUTER/PALLET。 */
    private String packageLevel;

    /** 上级包装编号（外箱/托盘）。 */
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

    /** 包装状态：OPEN/SEALED/SHIPPED。 */
    private String packageStatus;

    /** 封箱时间。 */
    private LocalDateTime packedAt;

    /** 操作人。 */
    private String operator;

    private String remark;
}
