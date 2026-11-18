package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 会计期间保存请求（对应 WBS T028 会计科目与会计期间，属 G3-N6 ERP 财务）。
 */
@Data
public class ErpFinancePeriodSaveRequest {

    /** 期间编码。 */
    @NotBlank(message = "期间编码不能为空")
    private String periodCode;

    /** 期间年度。 */
    private Integer periodYear;

    /** 期间月份。 */
    private Integer periodMonth;

    /** 开始日期。 */
    private LocalDate startDate;

    /** 结束日期。 */
    private LocalDate endDate;

    /** 期间状态，为空默认 OPEN。 */
    private String periodStatus;

    /** 关账时间。 */
    private LocalDateTime closedAt;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
