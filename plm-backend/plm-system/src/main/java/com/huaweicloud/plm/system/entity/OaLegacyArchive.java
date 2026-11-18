package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 现有OA只读封存（OA-DEV-119）：封存类型、封存范围、快照路径与校验、保留策略与查询入口。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_legacy_archive")
public class OaLegacyArchive extends BaseEntity {

    /** 封存编号。 */
    private String archiveNo;

    /** 封存名称。 */
    private String archiveName;

    /** 封存类型：READONLY/OFFLINE。 */
    private String archiveType;

    /** 封存范围。 */
    private String archiveScope;

    /** 快照路径。 */
    private String snapshotPath;

    /** 快照校验值。 */
    private String snapshotChecksum;

    /** 保留年限。 */
    private Integer retentionYears;

    /** 保留策略。 */
    private String retentionPolicy;

    /** 备份是否已校验：0否/1是。 */
    private Integer backupVerified;

    /** 查询入口。 */
    private String queryEntry;

    /** 封存状态：PENDING/ARCHIVED。 */
    private String archiveStatus;

    /** 封存时间。 */
    private LocalDateTime archiveTime;

    /** 审批人。 */
    private String approver;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
