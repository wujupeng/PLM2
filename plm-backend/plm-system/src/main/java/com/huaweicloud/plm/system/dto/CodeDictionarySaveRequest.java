package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 统一码表保存请求。
 */
@Data
public class CodeDictionarySaveRequest {

    @NotBlank(message = "字典类型不能为空")
    private String dictType;

    @NotBlank(message = "字典取值编码不能为空")
    private String dictCode;

    @NotBlank(message = "字典取值名称不能为空")
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
