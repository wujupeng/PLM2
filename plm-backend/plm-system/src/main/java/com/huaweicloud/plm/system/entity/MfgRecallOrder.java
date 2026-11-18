package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 召回/批次隔离单（N8，DEV-094）：按物料批次/生产批次/客户/日期圈定风险范围并冻结库存与待发产品。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mfg_recall_order")
public class MfgRecallOrder extends BaseEntity {

    /** 召回单号（唯一）。 */
    private String recallNo;

    /** 召回类型：MATERIAL_BATCH/PRODUCTION_BATCH/CUSTOMER/DATE_RANGE。 */
    private String recallType;

    /** 触发来源。 */
    private String triggerSource;

    /** 目标值（批次号/客户/日期范围等）。 */
    private String targetValue;

    /** 风险等级：LOW/MEDIUM/HIGH。 */
    private String riskLevel;

    /** 召回状态：OPEN/ISOLATING/ISOLATED/CLOSED。 */
    private String recallStatus;

    /** 影响数量。 */
    private Integer affectedCount;

    /** 责任人。 */
    private String owner;

    /** 发起时间。 */
    private LocalDateTime openedAt;

    /** 关闭时间。 */
    private LocalDateTime closedAt;

    /** 关闭证据。 */
    private String closeEvidence;

    /** 召回原因。 */
    private String reason;

    private String remark;
}
