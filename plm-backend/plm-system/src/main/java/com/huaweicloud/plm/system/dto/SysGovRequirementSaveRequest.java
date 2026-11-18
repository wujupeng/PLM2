package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 需求保存请求（G1-N7 WBS T004 需求追踪）。
 */
@Data
public class SysGovRequirementSaveRequest {

    /** 需求编号（为空时自动生成）。 */
    private String reqNo;

    /** 需求编码。 */
    private String reqCode;

    /** 需求名称。 */
    @NotBlank(message = "需求名称不能为空")
    private String reqName;

    /** 需求类型：BUSINESS/FUNCTION/DATA/API/NONFUNCTION 等，为空默认 BUSINESS。 */
    private String reqType;

    /** 需求来源。 */
    private String source;

    /** 业务模块。 */
    private String bizModule;

    /** 需求优先级：P0/P1/P2/P3，为空默认 P1。 */
    private String reqPriority;

    /** 需求状态，为空默认 PROPOSED。 */
    private String reqStatus;

    /** 验收标准。 */
    private String acceptanceCriteria;

    /** 责任人。 */
    private String ownerName;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
