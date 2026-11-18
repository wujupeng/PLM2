package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 数据异常队列（G1-N6 公共平台底座—通用能力 WBS T105 数据质量控制）：
 * 承接校验不通过的数据记录，记录规则、目标实体、记录主键与业务键、异常信息与处理状态，
 * 由数据管家在队列中处理，避免脏数据在各系统间扩散。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_data_quality_exception")
public class SysDataQualityException extends BaseEntity {

    /** 异常编号（唯一，支持人工指定）。 */
    private String exceptionNo;

    /** 命中规则编码。 */
    private String ruleCode;

    /** 目标实体。 */
    private String targetEntity;

    /** 记录主键。 */
    private Long recordId;

    /** 记录业务键。 */
    private String recordKey;

    /** 异常级别：ERROR/WARN，默认 ERROR。 */
    private String errorLevel;

    /** 异常信息。 */
    private String errorMessage;

    /** 处理状态：OPEN/HANDLING/RESOLVED/IGNORED，默认 OPEN。 */
    private String exceptionStatus;

    /** 处理人。 */
    private String handlerName;

    /** 处理时间。 */
    private LocalDateTime handledTime;

    /** 处理说明。 */
    private String handleNote;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
