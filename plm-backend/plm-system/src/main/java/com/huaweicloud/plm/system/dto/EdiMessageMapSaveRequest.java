package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * EDI 报文映射保存请求。
 */
@Data
public class EdiMessageMapSaveRequest {

    @NotBlank(message = "映射编码不能为空")
    private String mapCode;

    @NotBlank(message = "映射名称不能为空")
    private String mapName;

    /** 伙伴编码，* 表示通用。 */
    private String partnerCode;

    @NotBlank(message = "交易代码不能为空")
    private String transCode;

    /** 标准：X12/EDIFACT。 */
    private String standard;

    /** 方向：INBOUND/OUTBOUND。 */
    private String direction;

    /** 作用域：HEADER/LINE。 */
    private String scope;

    @NotBlank(message = "源字段路径不能为空")
    private String sourcePath;

    @NotBlank(message = "目标字段不能为空")
    private String targetField;

    /** 转换类型：DIRECT/DICT/DATE/CONST。 */
    private String transformType;

    /** 字典类型（DICT 转换时使用）。 */
    private String dictType;

    /** 日期格式（DATE 转换时使用）。 */
    private String datePattern;

    /** 默认值。 */
    private String defaultValue;

    /** 是否必填：1 是 / 0 否。 */
    private Integer requiredFlag;

    /** 排序号。 */
    private Integer sortNo;

    /** 状态：1 启用 / 0 停用。 */
    private Integer status;

    private String remark;
}
