package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProcessNodeSaveRequest {

    @NotBlank(message = "节点编码不能为空")
    private String nodeCode;

    @NotBlank(message = "节点名称不能为空")
    private String nodeName;

    private String nodeType;

    private String approverType;

    private String approverValue;

    private Integer allowDelegate;

    private Integer sortNo;

    private String remark;
}
