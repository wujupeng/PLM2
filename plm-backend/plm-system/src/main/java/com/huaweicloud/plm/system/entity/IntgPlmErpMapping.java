package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 字段映射记录：登记 PLM→ERP 集成字段映射的编号、名称、所属接口、对象类型、源字段、
 * 目标字段、转换规则、默认值、必填标记、状态及组织信息，支撑集成字段映射管理。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("intg_plm_erp_mapping")
public class IntgPlmErpMapping extends BaseEntity {

    /** 映射编号（为空时自动生成）。 */
    private String mappingNo;

    /** 映射名称。 */
    private String mappingName;

    /** 所属接口编号。 */
    private String interfaceNo;

    /** 集成对象类型，默认 MATERIAL。 */
    private String objectType;

    /** 源字段。 */
    private String sourceField;

    /** 目标字段。 */
    private String targetField;

    /** 转换规则。 */
    private String transformRule;

    /** 默认值。 */
    private String defaultValue;

    /** 必填标记，默认 0。 */
    private Integer requiredFlag;

    /** 映射状态，默认 DRAFT。 */
    private String mappingStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
