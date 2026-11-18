package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.OaProcessDefinition;
import com.huaweicloud.plm.system.entity.OaProcessNode;
import lombok.Data;

import java.util.List;

/**
 * 流程详情：流程定义 + 节点清单。
 */
@Data
public class ProcessDetailResponse {

    private OaProcessDefinition process;

    private List<OaProcessNode> nodes;
}
