package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class ProcessDefinitionSaveRequest {

    @NotBlank(message = "流程编码不能为空")
    private String processCode;

    @NotBlank(message = "流程名称不能为空")
    private String processName;

    private Long formId;

    private String category;

    private String status;

    private String definitionJson;

    private String description;

    private String remark;

    /** 流程节点清单，保存时全量覆盖。 */
    private List<ProcessNodeSaveRequest> nodes;
}
