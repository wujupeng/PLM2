package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * CAD 属性提取异常记录（DEV-033 ~ DEV-038 CAD 集成）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cad_extract_error")
public class CadExtractError extends BaseEntity {

    /** 所属 CAD 文件 ID。 */
    private Long cadFileId;

    /** 属性名。 */
    private String attrName;

    /** 异常类型：missing/unmapped。 */
    private String errorType;

    /** 异常说明。 */
    private String errorMessage;

    /** 原始值。 */
    private String rawValue;
}
