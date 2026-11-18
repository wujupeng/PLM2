package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_dictionary")
public class SysDictionary extends BaseEntity {

    /** 字典类型，例如 code_14_client_part_no。 */
    private String dictType;

    private String dictLabel;

    private String dictValue;

    private Integer sortNo;

    private Integer status;

    private String remark;
}
