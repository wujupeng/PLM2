package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 迁移异常（N9，DEV-098）：迁移过程中的异常明细与处理清单。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("int_migration_exception")
public class IntMigrationException extends BaseEntity {

    /** 关联任务编号。 */
    private String taskNo;

    /** 源数据主键。 */
    private String sourceKey;

    /** 异常类型：FIELD_INVALID/DUPLICATE/MISSING_REF/FORMAT_ERROR。 */
    private String exceptionType;

    /** 异常字段。 */
    private String fieldName;

    /** 异常原因。 */
    private String reason;

    /** 原始数据。 */
    private String rawData;

    /** 处理状态：OPEN/RESOLVED/IGNORED。 */
    private String handleStatus;

    /** 处理人。 */
    private String handler;

    /** 处理时间。 */
    private LocalDateTime handledAt;

    private String remark;
}
