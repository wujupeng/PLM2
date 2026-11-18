package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** 缺陷分派请求（N9，DEV-106）。 */
@Data
public class IntDefectAssignRequest {

    /** 处理人。 */
    @NotBlank(message = "处理人不能为空")
    private String assignee;

    /** 备注。 */
    private String remark;
}
