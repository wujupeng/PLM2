package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 未结业务迁移异常补偿保存请求。
 */
@Data
public class MigOpenBusinessCompensationSaveRequest {

    /** 补偿编号（为空时自动生成）。 */
    private String compensationNo;

    /** 批次号。 */
    private String batchNo;

    /** 接口编号。 */
    private String interfaceNo;

    /** 集成对象类型，为空默认 OPEN_SALES_ORDER。 */
    private String objectType;

    /** 对象编号。 */
    @NotBlank(message = "对象编号不能为空")
    private String objectNo;

    /** 错误类型，为空默认 VALIDATION。 */
    private String errorType;

    /** 错误信息。 */
    private String errorMessage;

    /** 重试次数，为空默认 0。 */
    private Integer retryCount;

    /** 处理人。 */
    private String handler;

    /** 处理时间。 */
    private LocalDateTime handleTime;

    /** 补偿状态，为空默认 PENDING。 */
    private String compensationStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
