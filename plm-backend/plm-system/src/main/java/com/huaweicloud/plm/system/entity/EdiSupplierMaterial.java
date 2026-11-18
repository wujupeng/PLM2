package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 供应商供货关系与分配规则（N6，DEV-070）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("edi_supplier_material")
public class EdiSupplierMaterial extends BaseEntity {

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 物料编码。 */
    private String materialCode;

    /** 供货份额百分比。 */
    private BigDecimal sharePct;

    /** 交付提前期（天）。 */
    private Integer leadTimeDays;

    /** 优先级。 */
    private Integer priority;

    /** 发送渠道：API/MAIL/EDI。 */
    private String sendChannel;

    /** 状态：1 启用 / 0 停用。 */
    private Integer status;

    private String remark;
}
