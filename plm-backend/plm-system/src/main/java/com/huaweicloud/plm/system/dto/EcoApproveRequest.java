package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 工程变更单（ECO）审批请求。
 */
@Data
public class EcoApproveRequest {

    @NotBlank(message = "审批结论不能为空")
    private String decision;

    /** 审批意见。 */
    private String comment;
}
