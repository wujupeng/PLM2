package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.entity.OaTask;
import com.huaweicloud.plm.system.entity.OaTaskRecord;
import lombok.Data;

import java.util.List;

/**
 * 流程实例详情：实例 + 审批轨迹 + 当前待办任务。
 */
@Data
public class InstanceDetailResponse {

    private OaProcessInstance instance;

    private List<OaTaskRecord> records;

    private List<OaTask> pendingTasks;
}
