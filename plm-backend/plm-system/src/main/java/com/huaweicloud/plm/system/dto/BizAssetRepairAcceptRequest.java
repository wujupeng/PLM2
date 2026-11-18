package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 设备维修工单验收入参（OA-DEV-078）。
 */
@Data
public class BizAssetRepairAcceptRequest {

    /** 验收结果：可配置字典 oa_accept_result。 */
    private String acceptResult;

    private String acceptOpinion;
}
