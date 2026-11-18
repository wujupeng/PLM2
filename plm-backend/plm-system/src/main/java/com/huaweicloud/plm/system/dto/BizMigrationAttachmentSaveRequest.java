package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 附件迁移任务保存请求（OA-DEV-099）。
 */
@Data
public class BizMigrationAttachmentSaveRequest {

    /** 任务编号。 */
    private String taskNo;

    /** 所属批次ID。 */
    private Long batchId;

    /** 对象编码。 */
    private String objectCode;

    /** 源文件路径。 */
    @NotBlank(message = "源文件路径不能为空")
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

    /** 迁移状态：PENDING/RUNNING/SUCCESS/FAILED/RETRYING。 */
    private String transferStatus;

    /** 重试次数。 */
    private Integer retryCount;

    /** 错误信息。 */
    private String errorMsg;

    /** 备注。 */
    private String remark;
}
