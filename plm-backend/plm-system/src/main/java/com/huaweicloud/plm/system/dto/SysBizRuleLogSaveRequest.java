package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 规则执行日志保存请求（G1-N6 WBS T104 业务规则引擎）。
 */
@Data
public class SysBizRuleLogSaveRequest {

    /** 日志编号（为空时自动生成）。 */
    private String logNo;

    /** 规则编码。 */
    private String ruleCode;

    /** 业务模块。 */
    private String bizModule;

    /** 业务主键。 */
    private String bizKey;

    /** 输入数据（JSON 字符串）。 */
    private String inputData;

    /** 输出数据（JSON 字符串）。 */
    private String outputData;

    /** 命中结果：MATCH/NOT_MATCH/ERROR，为空默认 MATCH。 */
    private String matchResult;

    /** 执行耗时（毫秒），为空默认 0。 */
    private Integer costMs;

    /** 执行时间（为空默认当前时间）。 */
    private String execTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
