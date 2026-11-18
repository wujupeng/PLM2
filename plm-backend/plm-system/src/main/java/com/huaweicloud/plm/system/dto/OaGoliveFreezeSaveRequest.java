package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 冻结旧OA关键写入保存请求（OA-DEV-114）。
 */
@Data
public class OaGoliveFreezeSaveRequest {

    /** 冻结编号。 */
    private String freezeNo;

    /** 冻结名称。 */
    @NotBlank(message = "冻结名称不能为空")
    private String freezeName;

    /** 冻结类型：ALL/PARTIAL。 */
    private String freezeType;

    /** 冻结范围。 */
    private String freezeScope;

    /** 冻结开始时间（yyyy-MM-dd HH:mm:ss）。 */
    private String freezeStart;

    /** 冻结结束时间（yyyy-MM-dd HH:mm:ss）。 */
    private String freezeEnd;

    /** 是否只读保留：1 是，0 否。 */
    private Integer readOnlyRetained;

    /** 应急预案。 */
    private String emergencyPlan;

    /** 是否已发布通知：1 是，0 否。 */
    private Integer noticePublished;

    /** 通知时间（yyyy-MM-dd HH:mm:ss）。 */
    private String noticeTime;

    /** 冻结状态：PENDING/ACTIVE/RELEASED。 */
    private String freezeStatus;

    /** 值守负责人。 */
    private String dutyPerson;

    /** 操作人。 */
    private String operatorName;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
