package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 数据异常记录保存请求（G1-N6 WBS T105 数据质量控制）。
 */
@Data
public class SysDataQualityExceptionSaveRequest {

    /** 异常编号（为空时自动生成）。 */
    private String exceptionNo;

    /** 命中规则编码。 */
    @NotBlank(message = "规则编码不能为空")
    private String ruleCode;

    /** 目标实体。 */
    @NotBlank(message = "目标实体不能为空")
    private String targetEntity;

    /** 记录主键。 */
    private Long recordId;

    /** 记录业务键。 */
    private String recordKey;

    /** 异常级别：ERROR/WARN，为空默认 ERROR。 */
    private String errorLevel;

    /** 异常信息。 */
    private String errorMessage;

    /** 处理状态：OPEN/HANDLING/RESOLVED/IGNORED，为空默认 OPEN。 */
    private String exceptionStatus;

    /** 处理人。 */
    private String handlerName;

    /** 处理说明。 */
    private String handleNote;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
