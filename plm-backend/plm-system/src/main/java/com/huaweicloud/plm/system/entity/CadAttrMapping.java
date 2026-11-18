package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * CAD 属性与 PLM 字段映射配置（DEV-033 ~ DEV-038 CAD 集成）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cad_attr_mapping")
public class CadAttrMapping extends BaseEntity {

    /** CAD 属性名。 */
    private String cadAttrName;

    /** CAD 属性显示名。 */
    private String cadAttrLabel;

    /** PLM 字段名。 */
    private String plmFieldName;

    /** PLM 字段显示名。 */
    private String plmFieldLabel;

    /** 目标实体，如 document。 */
    private String targetEntity;

    /** 是否必填：0-否 1-是。 */
    private Integer requiredFlag;

    /** 转换规则。 */
    private String transformRule;

    /** 默认值。 */
    private String defaultValue;

    /** 排序号。 */
    private Integer sortNo;

    /** 状态：0-停用 1-启用。 */
    private Integer status;

    private String remark;
}
