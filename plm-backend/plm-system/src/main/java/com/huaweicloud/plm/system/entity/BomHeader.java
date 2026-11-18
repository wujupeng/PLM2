package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * BOM 头（DEV-025 / DEV-026 / DEV-028 / DEV-030 / DEV-032）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("bom_header")
public class BomHeader extends BaseEntity {

    /** BOM 编码。 */
    private String bomCode;

    /** 产品 ID。 */
    private Long productId;

    /** 产品编码。 */
    private String productCode;

    /** BOM 类型：EBOM/MBOM。 */
    private String bomType;

    /** 业务版本号，如 V1、V2。 */
    private String versionNo;

    /** 状态：draft/released/obsolete。 */
    private String status;

    /** 生效日期。 */
    private LocalDate effectiveFrom;

    /** 失效日期。 */
    private LocalDate effectiveTo;

    /** 来源导入批次 ID。 */
    private Long sourceBatchId;

    /** 来源 BOM 头 ID（EBOM 转 MBOM 时记录）。 */
    private Long sourceBomId;

    /** 描述。 */
    private String description;

    private String remark;
}
