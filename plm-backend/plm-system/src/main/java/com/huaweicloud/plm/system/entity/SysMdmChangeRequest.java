package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 主数据平台—变更申请（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 登记主数据新增/修改/停用/合并的申请与审批，保持变更可审计。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_mdm_change_request")
public class SysMdmChangeRequest extends BaseEntity {

    /** 变更申请编号（唯一）。 */
    private String changeNo;

    /** 主数据域编码。 */
    private String domainCode;

    /** 主数据编码。 */
    private String masterCode;

    /** 变更类型，默认 UPDATE。 */
    private String changeType;

    /** 变更前值。 */
    private String beforeValue;

    /** 变更后值。 */
    private String afterValue;

    /** 变更原因。 */
    private String changeReason;

    /** 申请状态，默认 SUBMITTED。 */
    private String requestStatus;

    /** 申请人名称。 */
    private String applicantName;

    /** 审批人名称。 */
    private String approverName;

    /** 申请时间。 */
    private LocalDateTime applyTime;

    /** 审批时间。 */
    private LocalDateTime approveTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
