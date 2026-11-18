package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 数据清洗日志（OA-DEV-098）：记录原值与清洗值，不直接覆盖原始数据，可追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_migration_clean_log")
public class OaMigrationCleanLog extends BaseEntity {

    /** 所属批次ID。 */
    private Long batchId;

    /** 触发规则ID。 */
    private Long ruleId;

    /** 触发规则编号。 */
    private String ruleNo;

    /** 对象编码。 */
    private String objectCode;

    /** 记录标识（源主键）。 */
    private String recordKey;

    /** 源值（原始数据）。 */
    private String sourceValue;

    /** 清洗后取值。 */
    private String cleanedValue;

    /** 清洗结果：CLEANED/SKIPPED/FAILED。 */
    private String cleanResult;

    /** 处理说明。 */
    private String message;

    /** 清洗时间。 */
    private LocalDateTime cleanTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
