package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 图文档版本（DEV-035）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("doc_version")
public class DocVersion extends BaseEntity {

    /** 所属图文档 ID。 */
    private Long documentId;

    /** 图文档编号。 */
    private String docNo;

    /** 版本号，如 V1、V2。 */
    private String versionNo;

    /** 文件名。 */
    private String fileName;

    /** 文件存储路径。 */
    private String filePath;

    /** 文件大小（字节）。 */
    private Long fileSize;

    /** 文件类型。 */
    private String fileType;

    /** 文件摘要（哈希）。 */
    private String fileHash;

    /** 元数据 JSON。 */
    private String metadataJson;

    /** 变更说明。 */
    private String changeNote;

    /** 状态：draft/in_review/approved/released。 */
    private String status;

    /** 发布时间。 */
    private LocalDateTime releasedAt;

    /** 发布人。 */
    private Long releasedBy;
}
