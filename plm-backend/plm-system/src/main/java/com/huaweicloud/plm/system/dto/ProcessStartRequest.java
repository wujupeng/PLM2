package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProcessStartRequest {

    @NotNull(message = "流程定义不能为空")
    private Long processId;

    private String title;

    private String businessKey;

    /** 表单填报数据（JSON 文本）。 */
    private String formDataJson;

    private String remark;
}
