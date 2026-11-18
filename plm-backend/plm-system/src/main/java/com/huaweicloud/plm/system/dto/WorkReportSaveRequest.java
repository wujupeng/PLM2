package com.huaweicloud.plm.system.dto;

import java.time.LocalDate;
import lombok.Data;

/**
 * 工作汇报保存入参。
 */
@Data
public class WorkReportSaveRequest {

    private String reportType;

    private String title;

    private String content;

    private LocalDate reportDate;

    private Long receiverUserId;

    private String attachmentJson;

    private String remark;
}
