package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 附件迁移任务（OA-DEV-099）：大文件分片、断点续传、哈希校验与失败重试。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_migration_attachment_task")
public class OaMigrationAttachmentTask extends BaseEntity {

    /** 任务编号。 */
    private String taskNo;

    /** 所属批次ID。 */
    private Long batchId;

    /** 对象编码。 */
    private String objectCode;

    /** 源文件路径。 */
    private String sourcePath;

    /** 目标文件路径。 */
    private String targetPath;

    /** 文件名。 */
    private String fileName;

    /** 文件大小（字节）。 */
    private Long fileSize;

    /** 文件类型。 */
    private String fileType;

    /** 分片总数。 */
    private Integer chunkTotal;

    /** 已完成分片数。 */
    private Integer chunkDone;

    /** 源文件哈希。 */
    private String fileHash;

    /** 目标文件哈希。 */
    private String targetHash;

    /** 哈希是否一致：0/1。 */
    private Integer hashMatched;

    /** 迁移状态：PENDING/RUNNING/SUCCESS/FAILED/RETRYING。 */
    private String transferStatus;

    /** 重试次数。 */
    private Integer retryCount;

    /** 错误信息。 */
    private String errorMsg;

    /** 迁移时间。 */
    private LocalDateTime transferTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
