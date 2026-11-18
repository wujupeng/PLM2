package com.huaweicloud.plm.system.dto;

import java.time.LocalDate;
import lombok.Data;

/**
 * 离职申请保存入参。
 */
@Data
public class HrResignationSaveRequest {

    private LocalDate lastWorkDate;

    private String resignationType;

    private String reason;

    private String handoverJson;

    private Long handoverUserId;

    private Integer accountDisableFlag;

    private String remark;

    private Boolean submit;
}
