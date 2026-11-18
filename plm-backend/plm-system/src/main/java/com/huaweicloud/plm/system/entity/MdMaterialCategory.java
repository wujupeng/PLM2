package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 物料分类（DEV-018）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("md_material_category")
public class MdMaterialCategory extends BaseEntity {

    /** 分类编码。 */
    private String categoryCode;

    /** 分类名称。 */
    private String categoryName;

    /** 上级分类 ID，0 表示顶级分类。 */
    private Long parentId;

    /** 编码规则配置键。 */
    private String codeRuleKey;

    /** 该分类必填字段，逗号分隔；为空时取默认必填字段配置。 */
    private String requiredFields;

    /** 排序号。 */
    private Integer sortNo;

    /** 状态：1=启用，0=停用。 */
    private Integer status;

    private String remark;
}
