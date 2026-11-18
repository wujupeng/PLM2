package com.huaweicloud.plm.system.dto;

import java.time.LocalDate;
import lombok.Data;

/**
 * 考勤异常申诉保存入参。
 */
@Data
public class HrAttExceptionSaveRequest {

    private String exceptionType;

    private LocalDate exceptionDate;

    private String exceptionDesc;

    private String applyReason;

    private String attachmentJson;

    private String remark;

    private Boolean submit;
}
