package com.huaweicloud.plm.system.dto;

import java.time.LocalDateTime;
import lombok.Data;

/**
 * 访客登记保存入参。
 */
@Data
public class HrVisitorSaveRequest {

    private String visitorName;

    private String visitorCompany;

    private String visitorPhone;

    private Integer visitorCount;

    private String visitReason;

    private String visitArea;

    private LocalDateTime visitStart;

    private LocalDateTime visitEnd;

    private Long hostUserId;

    private String vehicleNo;

    private String remark;

    private Boolean submit;
}
