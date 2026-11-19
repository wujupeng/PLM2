package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 同步批次保存请求。
 */
@Data
public class IntgDocumentChainBatchSaveRequest {

    /** 批次编号（为空时自动生成）。 */
    private String batchNo;

    /** 批次名称。 */
    @NotBlank(message = "批次名称不能为空")
    private String batchName;

    /** 所属接口编号。 */
    private String interfaceNo;

    /** 集成方向。 */
    private String direction;

    /** 集成对象类型。 */
    private String objectType;

    /** 触发方式。 */
    private String triggerType;

    /** 同步总条数。 */
    private Integer totalCount;

    /** 成功条数。 */
    private Integer successCount;

    /** 失败条数。 */
    private Integer failCount;

    /** 开始时间。 */
    private LocalDateTime startTime;

    /** 结束时间。 */
    private LocalDateTime endTime;

    /** 批次状态。 */
    private String batchStatus;

    /** 执行消息。 */
    private String message;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
