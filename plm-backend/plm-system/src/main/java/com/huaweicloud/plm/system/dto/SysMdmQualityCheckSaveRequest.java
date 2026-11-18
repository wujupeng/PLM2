package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 主数据质量校验保存请求（G1-N8 主数据平台 T007 质量校验）。
 */
@Data
public class SysMdmQualityCheckSaveRequest {

    /** 校验记录编号（为空时自动生成）。 */
    private String checkNo;

    /** 主数据域编码。 */
    @NotBlank(message = "主数据域编码不能为空")
    private String domainCode;

    /** 主数据编码。 */
    private String masterCode;

    /** 校验项。 */
    private String checkItem;

    /** 校验结果，为空默认 PASS。 */
    private String checkResult;

    /** 校验评分，为空默认 100。 */
    private Integer score;

    /** 校验信息。 */
    private String message;

    /** 校验时间，为空时取当前时间。 */
    private LocalDateTime checkTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
