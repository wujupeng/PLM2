package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/** 上线切换记录保存请求（N9，DEV-104）。 */
@Data
public class IntGoliveRecordSaveRequest {

    /** 上线编号（留空则自动生成）。 */
    private String goliveNo;

    /** 方案名称。 */
    @NotBlank(message = "方案名称不能为空")
    private String planName;

    /** 切换范围。 */
    private String scope;

    /** 计划切换时间。 */
    private LocalDateTime plannedAt;

    /** 回退预案。 */
    private String rollbackPlan;

    /** 责任人。 */
    private String owner;

    /** 备注。 */
    private String remark;
}
