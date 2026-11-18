package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.List;

/**
 * 需求分发发送请求（N6，DEV-070）：单个或批量发送。
 */
@Data
public class EdiDispatchSendRequest {

    /** 单个分发编号。 */
    private String dispatchNo;

    /** 批量分发编号清单。 */
    private List<String> dispatchNos;
}
