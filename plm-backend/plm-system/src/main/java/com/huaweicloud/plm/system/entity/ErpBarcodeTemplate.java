package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * ERP 条码管理—标签模板（对应 WBS G3-N7a ERP 条码管理）：
 * 登记标签模板编码、名称与标签尺寸及内容配置和打印权限，支撑条码标签的设计与套用。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_barcode_template")
public class ErpBarcodeTemplate extends BaseEntity {

    /** 模板编码（唯一，必填）。 */
    private String templateCode;

    /** 模板名称。 */
    private String templateName;

    /** 模板类型，默认 MATERIAL。 */
    private String templateType;

    /** 标签宽度，默认 40。 */
    private BigDecimal labelWidth;

    /** 标签高度，默认 30。 */
    private BigDecimal labelHeight;

    /** 内容配置。 */
    private String contentConfig;

    /** 打印权限。 */
    private String printPermission;

    /** 模板状态，默认 ACTIVE。 */
    private String templateStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
