package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 图文档评审节点分配人。
 */
@Data
public class DocReviewAssignee {

    /** 节点编码。 */
    private String nodeCode;

    /** 节点名称。 */
    private String nodeName;

    /** 分配人 ID。 */
    private Long assigneeId;

    /** 分配人名称。 */
    private String assigneeName;
}
