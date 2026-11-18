package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.List;

/**
 * 图文档提交评审请求。
 */
@Data
public class DocSubmitRequest {

    /** 版本号，为空时取文档当前版本。 */
    private String versionNo;

    /** 评审节点，逗号分隔。 */
    private String reviewNodes;

    /** 评审节点分配人。 */
    private List<DocReviewAssignee> assignees;
}
