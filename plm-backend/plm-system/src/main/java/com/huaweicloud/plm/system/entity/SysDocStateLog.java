package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 单据状态流转日志（G1-N6 公共平台底座—通用能力，WBS T102 单据状态机）：
 * 记录单据每一次状态变更的轨迹（含操作人、时间、原因），供审计追踪与问题定位，日志只追加不修改。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_doc_state_log")
public class SysDocStateLog extends BaseEntity {

    /** 日志编号（唯一，为空时自动生成）。 */
    private String logNo;

    /** 单据类型。 */
    private String docType;

    /** 单据号。 */
    private String docNo;

    /** 单据标题。 */
    private String bizTitle;

    /** 变更前状态编码。 */
    private String fromState;

    /** 变更后状态编码。 */
    private String toState;

    /** 动作编码。 */
    private String actionCode;

    /** 动作名称。 */
    private String actionName;

    /** 变更原因。 */
    private String reason;

    /** 操作人ID。 */
    private Long operatorId;

    /** 操作人姓名。 */
    private String operatorName;

    /** 操作时间。 */
    private LocalDateTime operateTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
