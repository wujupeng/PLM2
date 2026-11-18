package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * VMI 扫码收发。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_vmi_scan")
public class WmsVmiScan extends BaseEntity {

    /** 扫码单号。 */
    private String scanNo;

    /** 扫码类型，默认 IN。 */
    private String scanType;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库位编码。 */
    private String binCode;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 批次号。 */
    private String batchNo;

    /** 托盘号。 */
    private String palletNo;

    /** 扫码数量。 */
    private BigDecimal scanQty;

    /** 结存数量。 */
    private BigDecimal onHandQty;

    /** 扫码状态，默认 DRAFT。 */
    private String scanStatus;

    /** 操作人。 */
    private String operator;

    /** 扫码时间。 */
    private LocalDateTime scanTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
