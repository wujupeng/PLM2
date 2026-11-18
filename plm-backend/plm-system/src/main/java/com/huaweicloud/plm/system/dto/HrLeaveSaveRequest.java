package com.huaweicloud.plm.system.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

/**
 * 请假申请保存入参。
 */
@Data
public class HrLeaveSaveRequest {

    private String leaveType;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private BigDecimal leaveDays;

    private String reason;

    private String attachmentJson;

    private String remark;

    /** 是否补单：1=补单，0=正常申请。 */
    private Integer makeUpFlag;

    private Boolean submit;
}
