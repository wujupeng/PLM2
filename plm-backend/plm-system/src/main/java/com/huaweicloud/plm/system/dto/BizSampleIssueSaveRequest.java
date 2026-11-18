package com.huaweicloud.plm.system.dto;

import java.time.LocalDate;
import lombok.Data;

/**
 * 样品试制问题改善保存入参（OA-DEV-073）。关联 PLM 产品/BOM/文档。
 */
@Data
public class BizSampleIssueSaveRequest {

    private String projectCode;

    private String projectName;

    private String productCode;

    private String bomCode;

    private String partCode;

    private String partName;

    private String issueType;

    private String issueDesc;

    /** 严重程度：oa_issue_level（MINOR/MAJOR/CRITICAL）。 */
    private String severity;

    private Long responsibleUserId;

    private String responsibleName;

    private LocalDate dueDate;

    private String measure;

    private String verifyResult;

    private String plmRefNo;

    private String attachmentJson;

    private String remark;

    private Boolean submit;
}
