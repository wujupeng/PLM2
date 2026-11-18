package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 数据清洗规则保存请求（OA-DEV-098）。
 */
@Data
public class BizMigrationCleanRuleSaveRequest {

    /** 规则编号。 */
    private String ruleNo;

    /** 规则名称。 */
    @NotBlank(message = "规则名称不能为空")
    private String ruleName;

    /** 对象编码。 */
    private String objectCode;

    /** 规则类型：DEDUP_USER/INVALID_ORG/MISSING_ATTACH/BAD_DATE/ORPHAN/ILLEGAL_STATUS。 */
    private String ruleType;

    /** 规则表达式。 */
    private String ruleExpr;

    /** 处理动作。 */
    private String action;

    /** 优先级。 */
    private Integer priority;

    /** 状态。 */
    private Integer status;

    /** 备注。 */
    private String remark;
}
