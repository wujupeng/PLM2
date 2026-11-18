package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 质量问题处理信息更新请求。
 */
@Data
public class QualityIssueUpdateRequest {

    /** 问题标题。 */
    private String title;

    /** 严重度：minor/major/critical。 */
    private String severity;

    /** 问题描述。 */
    private String issueDesc;

    /** 责任部门。 */
    private String responsibleDept;

    /** 责任人 ID。 */
    private Long responsibleId;

    /** 责任人姓名。 */
    private String responsibleName;

    /** 临时措施。 */
    private String tempAction;

    /** 根因分析。 */
    private String rootCause;

    /** 永久措施。 */
    private String permanentAction;

    private String remark;
}
