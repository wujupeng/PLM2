package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 文档元数据：标题、附件、创建人、目录、时间、状态与扩展字段。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_document")
public class OaDocument extends BaseEntity {

    private String docNo;

    private String title;

    private Long folderId;

    private String docType;

    /** 文档状态：DRAFT/IN_REVIEW/PUBLISHED/VOID/ARCHIVED。 */
    private String status;

    /** 来源类型：MANUAL/WORKFLOW/MAIL/IMPORT。 */
    private String sourceType;

    private Long sourceBizId;

    private String sourceBizNo;

    private Long ownerUserId;

    private String ownerName;

    private Long ownerDeptId;

    private String ownerDeptName;

    private Long currentVersionId;

    private Integer currentVersionNo;

    private String fileName;

    private Long fileSize;

    private String contentType;

    private String fileHash;

    private String summary;

    private String keywords;

    private String tags;

    /** 作废、归档时需要置空，故声明为始终更新。 */
    @TableField(updateStrategy = FieldStrategy.ALWAYS)
    private LocalDateTime publishedAt;

    private Integer archivedFlag;

    private Long viewCount;

    private Long downloadCount;

    private Integer lockFlag;

    private Long lockUserId;

    /** 扩展字段：JSON 承载旧系统已知但未固定建模的列表字段，保证可导出可追溯。 */
    private String extJson;

    private String remark;
}
