package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 单据追溯保存请求（对应 WBS G3-N7a ERP 业务单据追踪）。
 */
@Data
public class ErpDocTrackSaveRequest {

    /** 追溯号（为空时自动生成）。 */
    private String traceNo;

    /** 单据类型。 */
    @NotBlank(message = "单据类型不能为空")
    private String docType;

    /** 单据编号。 */
    @NotBlank(message = "单据编号不能为空")
    private String docNo;

    /** 单据标题。 */
    private String docTitle;

    /** 来源单据类型。 */
    private String sourceDocType;

    /** 来源单据编号。 */
    private String sourceDocNo;

    /** 目标单据类型。 */
    private String targetDocType;

    /** 目标单据编号。 */
    private String targetDocNo;

    /** 追溯层级，为空默认 1。 */
    private Integer trackLevel;

    /** 业务状态，为空默认 OPEN。 */
    private String bizStatus;

    /** 审批状态，为空默认 NONE。 */
    private String approvalStatus;

    /** 审批流程实例编号。 */
    private String approvalInstanceNo;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
