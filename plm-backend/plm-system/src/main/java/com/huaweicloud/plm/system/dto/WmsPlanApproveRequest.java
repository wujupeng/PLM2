package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 应急预案审批请求（N7，DEV-084）。
 */
@Data
public class WmsPlanApproveRequest {

    /** 审批人。 */
    private String approver;

    private String remark;
}
