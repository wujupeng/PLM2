package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 执行最终全量及增量迁移（OA-DEV-115）：迁移批次、抽取范围、导入结果与校验状态。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_final_migration")
public class OaFinalMigration extends BaseEntity {

    /** 迁移编号。 */
    private String migNo;

    /** 迁移名称。 */
    private String migName;

    /** 迁移类型：FULL/INCREMENT。 */
    private String migType;

    /** 抽取范围。 */
    private String sourceScope;

    /** 抽取开始时间。 */
    private LocalDateTime extractStart;

    /** 抽取结束时间。 */
    private LocalDateTime extractEnd;

    /** 导入成功条数。 */
    private Long importedCount;

    /** 导入失败条数。 */
    private Long failedCount;

    /** 附件数量。 */
    private Long attachmentCount;

    /** 校验状态：PENDING/VERIFIED/EXCEPTION。 */
    private String verifyStatus;

    /** 校验是否通过：1 通过，0 不通过。 */
    private Integer verifyPass;

    /** 迁移状态：PENDING/SUCCESS/PARTIAL/FAILED。 */
    private String migStatus;

    /** 操作人。 */
    private String operatorName;

    /** 迁移时间。 */
    private LocalDateTime migTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
