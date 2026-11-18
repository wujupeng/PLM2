package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 追踪链接保存请求（G1-N7 WBS T004 需求追踪）。
 */
@Data
public class SysGovTraceLinkSaveRequest {

    /** 追踪链接编号（为空时自动生成）。 */
    private String linkNo;

    /** 关联需求编码。 */
    @NotBlank(message = "关联需求编码不能为空")
    private String reqCode;

    /** 链接类型：FUNCTION/DATA/API/TEST/EVIDENCE 等，为空默认 FUNCTION。 */
    private String linkType;

    /** 目标引用（如功能编码、接口路径、用例编号）。 */
    private String targetRef;

    /** 目标名称。 */
    private String targetName;

    /** 链接说明。 */
    private String linkDesc;

    /** 链接状态，为空默认 ACTIVE。 */
    private String linkStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
