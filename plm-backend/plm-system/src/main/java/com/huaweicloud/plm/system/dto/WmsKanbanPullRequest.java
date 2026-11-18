package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 看板拉动请求（N7，DEV-076）。
 */
@Data
public class WmsKanbanPullRequest {

    /** 触发人。 */
    @NotBlank(message = "触发人不能为空")
    private String triggeredBy;

    /** 补货数量（可选，为空时按补货规则计算）。 */
    private BigDecimal qty;

    private String remark;
}
