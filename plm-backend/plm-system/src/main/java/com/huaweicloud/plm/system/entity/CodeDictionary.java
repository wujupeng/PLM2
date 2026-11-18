package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 统一码表（DEV-053）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("code_dictionary")
public class CodeDictionary extends BaseEntity {

    /** 字典类型，如 code_plant/code_year。 */
    private String dictType;

    /** 字典取值编码。 */
    private String dictCode;

    /** 字典取值名称。 */
    private String dictName;

    /** 扩展取值。 */
    private String extValue;

    /** 扩展文本。 */
    private String extText;

    /** 排序号。 */
    private Integer sortNo;

    /** 状态：1 启用 / 0 停用。 */
    private Integer status;

    private String remark;
}
