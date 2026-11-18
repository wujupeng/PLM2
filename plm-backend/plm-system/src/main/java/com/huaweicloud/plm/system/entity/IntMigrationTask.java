package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 迁移任务（N9，DEV-098）：历史数据清洗迁移的数量核对（迁移前后数量、关键字段与关系）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("int_migration_task")
public class IntMigrationTask extends BaseEntity {

    /** 任务编号（唯一）。 */
    private String taskNo;

    /** 迁移范围：MATERIAL/BOM/SUPPLIER/PRODUCT/DOCUMENT/TRACE。 */
    private String scope;

    /** 来源系统。 */
    private String sourceSystem;

    /** 目标表名。 */
    private String targetTable;

    /** 源数据条数。 */
    private Long sourceCount;

    /** 成功条数。 */
    private Long successCount;

    /** 失败条数。 */
    private Long failCount;

    /** 跳过条数。 */
    private Long skipCount;

    /** 任务状态：PENDING/RUNNING/SUCCESS/FAILED/PARTIAL。 */
    private String taskStatus;

    /** 开始时间。 */
    private LocalDateTime startedAt;

    /** 结束时间。 */
    private LocalDateTime finishedAt;

    /** 核对报告路径。 */
    private String reportPath;

    /** 操作人。 */
    private String operator;

    private String remark;
}
