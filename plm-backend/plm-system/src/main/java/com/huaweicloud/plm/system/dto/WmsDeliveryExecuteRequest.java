package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 物料配送任务执行请求（接单/配送/签收/取消，N7，DEV-077）。
 */
@Data
public class WmsDeliveryExecuteRequest {

    /** 配送人。 */
    private String assignee;

    /** 签收人。 */
    private String signBy;

    private String remark;
}
