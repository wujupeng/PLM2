package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 产品技术规格模板（DEV-042）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("spec_template")
public class SpecTemplate extends BaseEntity {

    /** 模板编码。 */
    private String templateCode;

    /** 模板名称。 */
    private String templateName;

    /** 产品系列。 */
    private String productSeries;

    /** 产品编码。 */
    private String productCode;

    /** 规格分类：electrical/mechanical 等。 */
    private String specCategory;

    /** 版本号。 */
    private String versionNo;

    /** 状态：draft/released/obsolete。 */
    private String status;

    /** 描述。 */
    private String description;

    private String remark;
}
