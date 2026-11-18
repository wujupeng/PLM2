package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 工序明细保存请求。
 */
@Data
public class ProcessOperationSaveRequest {

    /** 工序号，为空时按顺序自动生成。 */
    private Integer seqNo;

    @NotBlank(message = "工序编码不能为空")
    private String operationCode;

    @NotBlank(message = "工序名称不能为空")
    private String operationName;

    /** 工作中心。 */
    private String workCenter;

    /** 工艺参数。 */
    private String processParams;

    /** 工装夹具。 */
    private String fixtureTooling;

    /** 作业指导书编号。 */
    private String workInstructionDocNo;

    /** 标准工时。 */
    private String standardTime;

    /** 是否需要检验：0-否 1-是。 */
    private Integer inspectionRequired;

    /** 关联检验规范编码。 */
    private String inspectionSpecCode;

    /** 是否关键工序：0-否 1-是。 */
    private Integer keyOperation;

    private String remark;
}
