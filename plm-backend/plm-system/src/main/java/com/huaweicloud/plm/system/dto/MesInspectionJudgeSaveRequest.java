package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 检验判定保存请求。
 */
@Data
public class MesInspectionJudgeSaveRequest {

    /** 判定单号（为空时自动生成）。 */
    private String judgeNo;

    /** 来源类型，为空默认 INCOMING。 */
    private String sourceType;

    /** 来源单号。 */
    private String sourceNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 批次号。 */
    private String batchNo;

    /** 判定结果，为空默认 PASS。 */
    private String judgeResult;

    /** 判定状态，为空默认 DRAFT。 */
    private String judgeStatus;

    /** 判定数量。 */
    private BigDecimal judgeQty;

    /** 合格数量。 */
    private BigDecimal qualifiedQty;

    /** 不合格数量。 */
    private BigDecimal unqualifiedQty;

    /** 判定意见。 */
    private String judgeOpinion;

    /** 处置方式。 */
    private String disposition;

    /** 判定人。 */
    private String judgeBy;

    /** 判定时间。 */
    private LocalDateTime judgeTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
