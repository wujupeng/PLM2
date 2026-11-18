package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 治理里程碑保存请求（G1-N7 治理中心 T001 项目治理）。
 */
@Data
public class SysGovMilestoneSaveRequest {

    /** 里程碑编号（为空时自动生成）。 */
    private String milestoneNo;

    /** 所属项目编码。 */
    @NotBlank(message = "所属项目编码不能为空")
    private String projectCode;

    /** 里程碑编码。 */
    private String milestoneCode;

    /** 里程碑名称。 */
    @NotBlank(message = "里程碑名称不能为空")
    private String milestoneName;

    /** 计划达成时间。 */
    private LocalDateTime planDate;

    /** 实际达成时间。 */
    private LocalDateTime actualDate;

    /** 里程碑状态，为空默认 PENDING。 */
    private String milestoneStatus;

    /** 负责人。 */
    private String ownerName;

    /** 交付物。 */
    private String deliverable;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
