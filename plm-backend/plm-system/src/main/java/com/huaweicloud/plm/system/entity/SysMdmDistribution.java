package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 主数据平台—主数据分发（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 登记主数据向各目标系统的分发任务、状态与回执。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_mdm_distribution")
public class SysMdmDistribution extends BaseEntity {

    /** 分发编号（唯一，支持人工指定）。 */
    private String distNo;

    /** 主数据域编码。 */
    private String domainCode;

    /** 主数据编码。 */
    private String masterCode;

    /** 目标系统。 */
    private String targetSystem;

    /** 分发类型，默认 FULL。 */
    private String distType;

    /** 分发状态，默认 PENDING。 */
    private String distStatus;

    /** 分发时间。 */
    private LocalDateTime distTime;

    /** 回执时间。 */
    private LocalDateTime ackTime;

    /** 重试次数，默认 0。 */
    private Integer retryCount;

    /** 分发消息。 */
    private String message;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
