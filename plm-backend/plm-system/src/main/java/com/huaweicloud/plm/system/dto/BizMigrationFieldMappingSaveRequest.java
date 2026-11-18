package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 源目标字段映射保存请求（OA-DEV-096）。
 */
@Data
public class BizMigrationFieldMappingSaveRequest {

    /** 映射编号。 */
    private String mappingNo;

    /** 所属迁移对象编码。 */
    @NotBlank(message = "对象编码不能为空")
    private String objectCode;

    /** 源字段。 */
    @NotBlank(message = "源字段不能为空")
    private String sourceField;

    /** 目标字段。 */
    @NotBlank(message = "目标字段不能为空")
    private String targetField;

    /** 数据类型。 */
    private String dataType;

    /** 枚举映射。 */
    private String enumMapping;

    /** 取值映射。 */
    private String valueMapping;

    /** 转换规则。 */
    private String transformRule;

    /** 是否必填。 */
    private Boolean requiredFlag;

    /** 状态。 */
    private Integer status;

    /** 备注。 */
    private String remark;
}
