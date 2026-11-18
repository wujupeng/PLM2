package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 盘点发现保存请求（G1-N7 治理中心 T002 现状盘点）。
 */
@Data
public class SysGovAsisFindingSaveRequest {

    /** 发现编号（为空时自动生成）。 */
    private String findingNo;

    /** 关联存量系统编码。 */
    private String systemCode;

    /** 发现类型，为空默认 PAIN_POINT。 */
    private String findingType;

    /** 发现标题。 */
    @NotBlank(message = "发现标题不能为空")
    private String findingTitle;

    /** 发现描述。 */
    private String findingDesc;

    /** 严重程度，为空默认 MEDIUM。 */
    private String severity;

    /** 处置建议。 */
    private String suggestion;

    /** 发现状态，为空默认 OPEN。 */
    private String findingStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
