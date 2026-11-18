package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 标签补打请求。
 */
@Data
public class LabelReprintRequest {

    @NotBlank(message = "补打原因不能为空")
    private String reason;

    /** 补打数量，为空时沿用原任务数量。 */
    private Integer qty;

    /** 打印机名称，为空时沿用原任务打印机。 */
    private String printerName;
}
