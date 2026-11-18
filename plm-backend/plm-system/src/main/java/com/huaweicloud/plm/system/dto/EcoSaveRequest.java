package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * 工程变更单（ECO）保存请求。
 */
@Data
public class EcoSaveRequest {

    /** 变更单标题。 */
    private String title;

    /** 变更类型：add/modify/delete/switch。 */
    private String changeType;

    /** 变更方案说明。 */
    private String planDesc;

    /** 生效日期。 */
    private LocalDate effectiveDate;

    /** 生效批次。 */
    private String effectiveBatch;

    private String remark;
}
