package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 主数据编码发放保存请求（G1-N8 主数据平台 T007 编码发放）。
 */
@Data
public class SysMdmCodeIssueSaveRequest {

    /** 编码发放编号（为空时自动生成）。 */
    private String issueNo;

    /** 主数据域编码。 */
    @NotBlank(message = "主数据域编码不能为空")
    private String domainCode;

    /** 编码标准编码。 */
    private String standardCode;

    /** 主数据编码。 */
    private String masterCode;

    /** 编码流水号。 */
    private Long seqValue;

    /** 发放时间，为空时取当前时间。 */
    private LocalDateTime issueTime;

    /** 发放人名称，为空时取当前登录用户。 */
    private String issuedBy;

    /** 发放状态，为空默认 ISSUED。 */
    private String issueStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
