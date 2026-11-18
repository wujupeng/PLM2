package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 设备维修工单（OA-DEV-078）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_asset_repair_order")
public class OaAssetRepairOrder extends BaseEntity {

    /** 维修单号。 */
    private String repairNo;

    /** 资产类别：MACHINE 等。 */
    private String assetCategory;

    /** 资产编码。 */
    private String assetCode;

    /** 资产名称。 */
    private String assetName;

    /** 资产型号。 */
    private String assetModel;

    /** 位置。 */
    private String location;

    /** 故障类型。 */
    private String faultType;

    /** 故障描述。 */
    private String faultDesc;

    /** 优先级：LOW/NORMAL/HIGH/URGENT 等。 */
    private String priority;

    /** 报修时间。 */
    private LocalDateTime reportTime;

    /** 要求完成日期。 */
    private LocalDate requireFinish;

    /** 申请人用户ID。 */
    private Long applicantUserId;

    /** 申请人姓名。 */
    private String applicantName;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 维修状态：DRAFT/DISPATCHED/REPAIRING/ACCEPTED/CLOSED 等。 */
    private String repairStatus;

    /** 维修人用户ID。 */
    private Long assigneeUserId;

    /** 维修人姓名。 */
    private String assigneeName;

    /** 派工时间。 */
    private LocalDateTime dispatchTime;

    /** 派工备注。 */
    private String dispatchRemark;

    /** 故障原因。 */
    private String faultCause;

    /** 维修措施。 */
    private String repairMeasure;

    /** 更换备件。 */
    private String spareParts;

    /** 工时。 */
    private BigDecimal workHours;

    /** 维修费用。 */
    private BigDecimal repairCost;

    /** 维修完成时间。 */
    private LocalDateTime repairFinishTime;

    /** 停机时长（分钟）。 */
    private Integer downtimeMinutes;

    /** 重复故障标记：0 否，1 是。 */
    private Integer repeatFlag;

    /** 验收结果。 */
    private String acceptResult;

    /** 验收意见。 */
    private String acceptOpinion;

    /** 验收人用户ID。 */
    private Long acceptUserId;

    /** 验收人姓名。 */
    private String acceptUserName;

    /** 验收时间。 */
    private LocalDateTime acceptTime;

    /** 关闭时间。 */
    private LocalDateTime closeTime;

    /** 附件JSON。 */
    private String attachmentJson;

    /** 流程状态：DRAFT/RUNNING/APPROVED/REJECTED/CANCELLED。 */
    private String flowStatus;

    /** 流程实例ID。 */
    private Long instanceId;

    /** 流程实例编号。 */
    private String instanceNo;

    /** 取消标记：0 否，1 是。 */
    private Integer cancelFlag;

    /** 备注。 */
    private String remark;
}
