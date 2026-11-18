package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 编码规则保存请求（G1-N6 WBS T105 数据质量控制）。
 */
@Data
public class SysCodeRuleSaveRequest {

    /** 编码规则编号（为空时自动生成）。 */
    private String codeNo;

    /** 编码规则编码。 */
    private String codeCode;

    /** 编码规则名称。 */
    @NotBlank(message = "规则名称不能为空")
    private String codeName;

    /** 目标实体。 */
    @NotBlank(message = "目标实体不能为空")
    private String targetEntity;

    /** 编码前缀。 */
    private String prefix;

    /** 日期段格式：yyyyMMdd/yyyyMM/yyyy 等，为空则不拼接日期段。 */
    private String datePattern;

    /** 流水号长度，为空默认 4。 */
    private Integer seqLength;

    /** 重置周期：NONE/DAILY/MONTHLY/YEARLY，为空默认 NONE。 */
    private String resetCycle;

    /** 当前流水值，为空默认 0。 */
    private Integer currentSeq;

    /** 规则状态：ACTIVE/DISABLED，为空默认 ACTIVE。 */
    private String codeStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
