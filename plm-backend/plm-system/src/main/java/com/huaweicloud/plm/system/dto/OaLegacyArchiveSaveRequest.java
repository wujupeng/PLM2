package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 现有OA只读封存保存请求（OA-DEV-119）。
 */
@Data
public class OaLegacyArchiveSaveRequest {

    /** 封存编号。 */
    private String archiveNo;

    /** 封存名称。 */
    @NotBlank(message = "封存名称不能为空")
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

    /** 封存时间（yyyy-MM-dd HH:mm:ss）。 */
    private String archiveTime;

    /** 审批人。 */
    private String approver;

    /** 备注。 */
    private String remark;
}
