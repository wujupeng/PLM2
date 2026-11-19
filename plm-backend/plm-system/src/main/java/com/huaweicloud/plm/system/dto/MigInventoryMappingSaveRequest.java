package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 字段映射保存请求。
 */
@Data
public class MigInventoryMappingSaveRequest {

    /** 映射编号（为空时自动生成）。 */
    private String mappingNo;

    /** 映射名称。 */
    @NotBlank(message = "映射名称不能为空")
    private String mappingName;

    /** 所属接口编号。 */
    private String interfaceNo;

    /** 集成对象类型。 */
    private String objectType;

    /** 源字段。 */
    private String sourceField;

    /** 目标字段。 */
    private String targetField;

    /** 转换规则。 */
    private String transformRule;

    /** 默认值。 */
    private String defaultValue;

    /** 必填标记。 */
    private Integer requiredFlag;

    /** 映射状态。 */
    private String mappingStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
