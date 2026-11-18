package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 文档新建入参：与文件上传配合使用（multipart 表单同名字段绑定）。
 */
@Data
public class DocSaveRequest {

    @NotBlank(message = "文档标题不能为空")
    private String title;

    @NotNull(message = "所属目录不能为空")
    private Long folderId;

    private String docType;

    /** 文档状态：DRAFT/IN_REVIEW/PUBLISHED/VOID/ARCHIVED，默认 DRAFT。 */
    private String status;

    /** 来源类型：MANUAL/WORKFLOW/MAIL/IMPORT，默认 MANUAL。 */
    private String sourceType;

    private Long sourceBizId;

    private String sourceBizNo;

    private String summary;

    private String keywords;

    private String tags;

    /** 扩展字段 JSON。 */
    private String extJson;

    private String remark;

    /** 本次上传的修订说明，写入首个版本。 */
    private String revisionNote;
}
