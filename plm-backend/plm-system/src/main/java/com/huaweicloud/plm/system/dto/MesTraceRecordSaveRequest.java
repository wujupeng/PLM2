package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 追溯记录保存请求。
 */
@Data
public class MesTraceRecordSaveRequest {

    /** 追溯记录编号（为空时自动生成）。 */
    private String recordNo;

    /** 对象类型，为空默认 SERIAL。 */
    private String objectType;

    /** 对象编码。 */
    @NotBlank(message = "对象编码不能为空")
    private String objectCode;

    /** 追溯记录状态，为空默认 DRAFT。 */
    private String recordStatus;

    /** 追溯路径。 */
    private String tracePath;

    /** 追溯节点数。 */
    private Integer nodeCount;

    /** 追溯时间。 */
    private LocalDateTime recordTime;

    /** 追溯人。 */
    private String recorder;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
