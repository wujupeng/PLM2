package com.huaweicloud.plm.system.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

/**
 * 加班申请保存入参。
 */
@Data
public class HrOvertimeSaveRequest {

    private String overtimeType;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private BigDecimal overtimeHours;

    private String compensateType;

    private String reason;

    private String attachmentJson;

    private String remark;

    private Boolean submit;
}
