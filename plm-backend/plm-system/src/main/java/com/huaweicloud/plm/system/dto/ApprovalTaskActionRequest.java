package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 审批任务处理请求（G1-N6 WBS T103 可配置审批）：状态动作（通过/驳回/转办/重置）时可携带处理意见。
 */
@Data
public class ApprovalTaskActionRequest {

    /** 处理意见。 */
    private String handleComment;
}
