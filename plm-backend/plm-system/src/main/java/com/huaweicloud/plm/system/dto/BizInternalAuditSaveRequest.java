package com.huaweicloud.plm.system.dto;

import java.time.LocalDate;
import java.util.List;
import lombok.Data;

/**
 * 内部审核实施计划保存入参（OA-DEV-074）。审核计划与整改问题可追溯。
 */
@Data
public class BizInternalAuditSaveRequest {

    private String auditPlanName;

    private String auditScope;

    private String auditStandard;

    private LocalDate planStart;

    private LocalDate planEnd;

    private String auditorUserIds;

    private String auditorNames;

    private Long auditedDeptId;

    private String auditedDeptName;

    private String auditConclusion;

    private String attachmentJson;

    private String remark;

    private Boolean submit;

    private List<Item> issues;

    /** 审核问题项。 */
    @Data
    public static class Item {

        private String issueDesc;

        /** 问题级别：oa_issue_level（MINOR/MAJOR/CRITICAL）。 */
        private String issueLevel;

        private Long responsibleUserId;

        private String responsibleName;

        private LocalDate dueDate;

        private String correctAction;

        private String verifyResult;

        private String remark;
    }
}
