package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文件归档保存请求（G1-N3 公共平台底座—统一文件服务 WBS T011）。
 */
@Data
public class SysFileArchiveSaveRequest {

    /** 归档编号（为空时自动生成）。 */
    private String archiveNo;

    /** 所属附件编号。 */
    @NotBlank(message = "附件编号不能为空")
    private String fileNo;

    /** 文件名称。 */
    private String fileName;

    /** 归档类型：HOT/COLD/PERMANENT。 */
    private String archiveType;

    /** 存储级别：STANDARD/IA/ARCHIVE。 */
    private String storageClass;

    /** 保留年限。 */
    private Integer retentionYears;

    /** 归档存储路径。 */
    private String storagePath;

    /** 归档时间。 */
    private LocalDateTime archiveTime;

    /** 过期时间。 */
    private LocalDateTime expireTime;

    /** 归档状态：PENDING/ARCHIVED/RESTORING/RESTORED/EXPIRED。 */
    private String archiveStatus;

    /** 恢复状态：NONE/REQUESTED/DONE。 */
    private String restoreStatus;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
