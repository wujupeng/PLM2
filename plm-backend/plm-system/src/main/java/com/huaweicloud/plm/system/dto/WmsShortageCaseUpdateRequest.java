package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * 欠料异常单更新请求（N7，DEV-083）。
 */
@Data
public class WmsShortageCaseUpdateRequest {

    /** 影响工单（逗号分隔）。 */
    private String affectedWorkOrders;

    /** 责任人。 */
    private String owner;

    /** 欠料原因。 */
    private String cause;

    /** 临时措施。 */
    private String tempMeasure;

    /** 预计恢复日期。 */
    private LocalDate expectedRecoveryDate;

    private String remark;
}
