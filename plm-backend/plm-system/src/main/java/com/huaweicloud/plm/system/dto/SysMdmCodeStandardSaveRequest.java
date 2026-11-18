package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 编码标准保存请求（G1-N8 公共平台底座 T007 主数据平台）。
 */
@Data
public class SysMdmCodeStandardSaveRequest {

    /** 编码标准编号（为空时自动生成）。 */
    private String standardNo;

    /** 主数据域编码。 */
    @NotBlank(message = "主数据域编码不能为空")
    private String domainCode;

    /** 标准编码。 */
    @NotBlank(message = "标准编码不能为空")
    private String standardCode;

    /** 标准名称。 */
    @NotBlank(message = "标准名称不能为空")
    private String standardName;

    /** 编码模板。 */
    private String codePattern;

    /** 流水号位数，为空默认 4。 */
    private Integer seqLength;

    /** 重置周期，为空默认 NONE。 */
    private String resetCycle;

    /** 示例值。 */
    private String sampleValue;

    /** 标准状态，为空默认 ACTIVE。 */
    private String standardStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
