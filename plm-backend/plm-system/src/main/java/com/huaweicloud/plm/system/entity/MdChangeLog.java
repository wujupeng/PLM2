package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 物料/产品字段变更留痕（DEV-019 / DEV-023）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("md_change_log")
public class MdChangeLog extends BaseEntity {

    /** 实体类型，如 MATERIAL、PRODUCT。 */
    private String entityType;

    /** 实体 ID。 */
    private Long entityId;

    /** 实体编码。 */
    private String entityCode;

    /** 变更类型：UPDATE/REVISION/LIFECYCLE。 */
    private String changeType;

    /** 变更字段名。 */
    private String fieldName;

    /** 变更前值。 */
    private String oldValue;

    /** 变更后值。 */
    private String newValue;

    /** 操作人 ID。 */
    private Long operatorId;

    /** 操作人名称。 */
    private String operatorName;

    private String remark;
}
