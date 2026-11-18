package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * VMI 库位：登记 VMI 库位单号、库位类型、仓库编码、库位编码、物料信息、库位容量、托盘数、
 * 二维码定位、库位状态及组织信息，支撑 VMI 物料上架、拣选与库位容量追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_vmi_bin")
public class WmsVmiBin extends BaseEntity {

    /** VMI 库位单号。 */
    private String vmiBinNo;

    /** 库位类型，默认 STORAGE。 */
    private String binType;

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

    /** 库位容量。 */
    private BigDecimal capacityQty;

    /** 托盘数。 */
    private BigDecimal palletQty;

    /** 最大托盘数。 */
    private BigDecimal maxPalletQty;

    /** 二维码。 */
    private String qrCode;

    /** 库位状态，默认 IDLE。 */
    private String binStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
