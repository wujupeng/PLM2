package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.DocApprovalLog;
import com.huaweicloud.plm.system.entity.DocCategory;
import com.huaweicloud.plm.system.entity.DocDocument;
import com.huaweicloud.plm.system.entity.DocRelation;
import com.huaweicloud.plm.system.entity.DocReviewTask;
import com.huaweicloud.plm.system.entity.DocVersion;
import lombok.Data;

import java.util.List;

/**
 * 图文档明细返回组合。
 */
@Data
public class DocDocumentDetailResponse {

    /** 图文档主档。 */
    private DocDocument document;

    /** 所属分类。 */
    private DocCategory category;

    /** 当前版本。 */
    private DocVersion currentVersion;

    /** 关联关系列表。 */
    private List<DocRelation> relations;

    /** 评审任务列表。 */
    private List<DocReviewTask> reviewTasks;

    /** 审批日志列表。 */
    private List<DocApprovalLog> approvalLogs;
}
