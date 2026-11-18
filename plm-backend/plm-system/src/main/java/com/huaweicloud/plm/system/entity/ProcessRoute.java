package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 工艺路线（DEV-047）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("process_route")
public class ProcessRoute extends BaseEntity {

    /** 路线编码。 */
    private String routeCode;

    /** 路线名称。 */
    private String routeName;

    /** 产品编码。 */
    private String productCode;

    /** 产品名称。 */
    private String productName;

    /** 版本号。 */
    private String versionNo;

    /** 工艺版本。 */
    private String processVersion;

    /** 状态：draft/released/obsolete。 */
    private String status;

    /** 生效日期。 */
    private LocalDate effectiveDate;

    /** 描述。 */
    private String description;

    private String remark;
}
