package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 设备维修工单派工入参（OA-DEV-078）。
 */
@Data
public class BizAssetRepairDispatchRequest {

    private Long assigneeUserId;

    private String assigneeName;

    private String dispatchRemark;
}
