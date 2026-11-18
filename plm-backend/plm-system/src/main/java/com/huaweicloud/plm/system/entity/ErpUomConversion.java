package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import java.math.BigDecimal;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * ERP 基础资料—计量单位换算（G3-N1 ERP 基础资料 WBS T021）：
 * 登记计量单位之间的换算关系，含源/目标计量单位、换算率与关联物料。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_uom_conversion")
public class ErpUomConversion extends BaseEntity {

    /** 换算编号（唯一，支持人工指定）。 */
    private String conversionNo;

    /** 物料编码。 */
    private String materialCode;

    /** 源计量单位。 */
    private String fromUom;

    /** 目标计量单位。 */
    private String toUom;

    /** 换算率，默认 1。 */
    private BigDecimal conversionRate;

    /** 换算状态，默认 ACTIVE。 */
    private String conversionStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
