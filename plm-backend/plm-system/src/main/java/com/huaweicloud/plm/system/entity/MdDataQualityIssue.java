package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 物料数据质量问题清单（DEV-024）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("md_data_quality_issue")
public class MdDataQualityIssue extends BaseEntity {

    /** 规则编码。 */
    private String ruleCode;

    /** 规则名称。 */
    private String ruleName;

    /** 实体类型，如 MATERIAL。 */
    private String entityType;

    /** 实体 ID。 */
    private Long entityId;

    /** 实体编码。 */
    private String entityCode;

    /** 严重程度：error/warning/info。 */
    private String severity;

    /** 问题描述。 */
    private String message;

    /** 处理状态：open/fixed/ignored。 */
    private String status;

    private String remark;
}
