package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * ERP 工艺资源—标准工艺（对应 G3-N7b ERP 工艺资源）：
 * 登记物料标准工艺与标准工时，维护标准工艺编码、物料、版本、工艺路线与工时等信息。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_process_standard")
public class ErpProcessStandard extends BaseEntity {

    /** 标准工艺编码。 */
    private String standardCode;

    /** 标准工艺名称。 */
    private String standardName;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 版本号。 */
    private String versionNo;

    /** 工艺路线编码。 */
    private String routeCode;

    /** 标准工时，默认 0。 */
    private BigDecimal standardHours;

    /** 准备工时，默认 0。 */
    private BigDecimal setupHours;

    /** 工序数，默认 0。 */
    private Integer operationCount;

    /** 生效日期。 */
    private LocalDate effectiveDate;

    /** 失效日期。 */
    private LocalDate expireDate;

    /** 标准状态，默认 DRAFT。 */
    private String standardStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
