package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 端到端流程保存请求（G1-N7 治理中心 T003 流程建模）。
 */
@Data
public class SysGovProcessSaveRequest {

    /** 流程编号（为空时自动生成）。 */
    private String processNo;

    /** 流程编码（必填且唯一）。 */
    @NotBlank(message = "流程编码不能为空")
    private String processCode;

    /** 流程名称。 */
    @NotBlank(message = "流程名称不能为空")
    private String processName;

    /** 流程类型：O2C/P2P/P2M/R2S/D2M，为空默认 O2C。 */
    private String processType;

    /** 流程层级：L1/L2/L3/...，为空默认 L1。 */
    private String processLevel;

    /** 负责部门。 */
    private String ownerDept;

    /** 流程状态，为空默认 DRAFT。 */
    private String processStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述（长文本）。 */
    private String description;

    /** 备注。 */
    private String remark;
}
