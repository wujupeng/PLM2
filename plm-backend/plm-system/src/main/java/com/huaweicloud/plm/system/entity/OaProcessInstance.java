package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_process_instance")
public class OaProcessInstance extends BaseEntity {

    private String instanceNo;

    private Long processId;

    private String processCode;

    private String processName;

    private Long formId;

    /** 业务单据标识，便于与业务表关联。 */
    private String businessKey;

    private String title;

    private Long applicantUserId;

    private String applicantName;

    /** 实例状态：DRAFT/RUNNING/APPROVED/REJECTED/CANCELLED。 */
    private String instanceStatus;

    /** 当前所在节点编码，流程结束后需置空，故更新策略为 ALWAYS。 */
    @TableField(updateStrategy = FieldStrategy.ALWAYS)
    private String currentNodeCode;

    /** 表单填报数据（JSON 文本）。 */
    private String formDataJson;

    private LocalDateTime submittedAt;

    /** 流程结束时间，重新流转时需置空，故更新策略为 ALWAYS。 */
    @TableField(updateStrategy = FieldStrategy.ALWAYS)
    private LocalDateTime finishedAt;

    private String remark;
}
