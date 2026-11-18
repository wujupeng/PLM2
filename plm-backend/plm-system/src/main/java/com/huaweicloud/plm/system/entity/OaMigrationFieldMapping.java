package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 源目标字段映射字典（OA-DEV-096）：字段、枚举、值、转换规则与关联ID的映射定义。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_migration_field_mapping")
public class OaMigrationFieldMapping extends BaseEntity {

    /** 映射编号。 */
    private String mappingNo;

    /** 所属迁移对象编码。 */
    private String objectCode;

    /** 源字段。 */
    private String sourceField;

    /** 目标字段。 */
    private String targetField;

    /** 数据类型。 */
    private String dataType;

    /** 枚举映射（JSON）。 */
    private String enumMapping;

    /** 取值映射（JSON）。 */
    private String valueMapping;

    /** 转换规则。 */
    private String transformRule;

    /** 是否必填：0/1。 */
    private Integer requiredFlag;

    /** 状态：1 启用 / 0 停用。 */
    private Integer status;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
