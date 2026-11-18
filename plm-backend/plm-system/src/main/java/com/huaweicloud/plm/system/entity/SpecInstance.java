package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 产品技术规格实例（DEV-042 / DEV-043），承载具体产品的电气性能指标取值。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("spec_instance")
public class SpecInstance extends BaseEntity {

    /** 实例编码。 */
    private String instanceCode;

    /** 来源模板 ID。 */
    private Long templateId;

    /** 来源模板编码。 */
    private String templateCode;

    /** 产品编码。 */
    private String productCode;

    /** 产品名称。 */
    private String productName;

    /** 版本号。 */
    private String versionNo;

    /** 状态：draft/released/obsolete。 */
    private String status;

    /** 生效日期。 */
    private LocalDate effectiveDate;

    private String remark;
}
