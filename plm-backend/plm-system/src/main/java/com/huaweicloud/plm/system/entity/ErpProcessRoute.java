package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * ERP 工艺资源—工艺路线（对应 G3-N7b ERP 工艺资源—工艺路线）：
 * 维护主/替代路线与工序构成，登记路线编码、名称、物料、版本与状态。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_process_route")
public class ErpProcessRoute extends BaseEntity {

    /** 工艺路线编码。 */
    private String routeCode;

    /** 工艺路线名称。 */
    private String routeName;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 版本号，默认 V1.0。 */
    private String versionNo;

    /** 路线类型，默认 MAIN。 */
    private String routeType;

    /** 路线状态，默认 DRAFT。 */
    private String routeStatus;

    /** 工序数，默认 0。 */
    private Integer operationCount;

    /** 标准工艺编码。 */
    private String standardCode;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
