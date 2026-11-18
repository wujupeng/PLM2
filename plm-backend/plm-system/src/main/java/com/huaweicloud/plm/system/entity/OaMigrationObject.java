package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 迁移对象目录（OA-DEV-095）：定义历史数据迁移范围，记录源位置、目标对象与数量。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_migration_object")
public class OaMigrationObject extends BaseEntity {

    /** 对象编码（如 USER/ORG/PROCESS_INSTANCE/MAIL/DOCUMENT）。 */
    private String objectCode;

    /** 对象名称。 */
    private String objectName;

    /** 源系统。 */
    private String sourceSystem;

    /** 迁移方式：API/DB/FILE/EXPORT。 */
    private String sourceType;

    /** 源位置（表名/接口/目录）。 */
    private String sourceLocation;

    /** 目标对象。 */
    private String targetObject;

    /** 源记录数量。 */
    private Long sourceCount;

    /** 已迁移数量。 */
    private Long migratedCount;

    /** 是否必须迁移：0/1。 */
    private Integer migrateRequired;

    /** 迁移状态：PENDING/READY/RUNNING/DONE/SKIPPED。 */
    private String status;

    /** 最近迁移时间。 */
    private LocalDateTime lastMigrateTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
