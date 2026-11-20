package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 产品型号档案（DEV-017）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("md_product")
public class MdProduct extends BaseEntity {

    /** 产品编码。 */
    private String productCode;

    /** 产品名称。 */
    private String productName;

    /** 产品系列编码。 */
    private String seriesCode;

    /** 产品系列名称。 */
    private String seriesName;

    /** 客户编码。 */
    private String customerCode;

    /** 产品型号。 */
    private String model;

    /** 产品计量单位。 */
    private String unit;

    /** 状态：draft/released/obsolete。 */
    private String status;

    /** 产品描述。 */
    private String description;

    private String remark;
}
