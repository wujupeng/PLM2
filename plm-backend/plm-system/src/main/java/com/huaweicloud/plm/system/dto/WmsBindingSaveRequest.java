package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 防混料绑定保存请求（N7，DEV-080）。
 */
@Data
public class WmsBindingSaveRequest {

    @NotBlank(message = "绑定类型不能为空")
    private String bindType;

    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 产线。 */
    private String lineCode;

    /** 工位。 */
    private String workStation;

    /** 批次号。 */
    private String batchNo;

    /** 容器编码。 */
    private String containerCode;

    /** 生效开始时间。 */
    private LocalDateTime effectiveFrom;

    /** 生效结束时间。 */
    private LocalDateTime effectiveTo;

    /** 状态：enabled/disabled。 */
    private String bindStatus;

    private String remark;
}
