package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 完成知识转移和质保保存请求（OA-DEV-121）。
 */
@Data
public class OaOpsHandoverSaveRequest {

    /** 交接编号。 */
    private String handoverNo;

    /** 交接名称。 */
    @NotBlank(message = "交接名称不能为空")
    private String handoverName;

    /** 交付物类型：SOURCE/DOC/ENV。 */
    private String deliverableType;

    /** 交付物说明。 */
    private String deliverableDesc;

    /** 交付位置。 */
    private String location;

    /** 交接状态：PENDING/DELIVERED/CONFIRMED。 */
    private String handoverStatus;

    /** 交付时间（yyyy-MM-dd HH:mm:ss）。 */
    private String deliveredTime;

    /** 接收人。 */
    private String receiver;

    /** 确认时间（yyyy-MM-dd HH:mm:ss）。 */
    private String confirmTime;

    /** 质保月数。 */
    private Integer warrantyMonths;

    /** 质保开始时间（yyyy-MM-dd HH:mm:ss）。 */
    private String warrantyStart;

    /** 质保结束时间（yyyy-MM-dd HH:mm:ss）。 */
    private String warrantyEnd;

    /** 是否验收确认：0 否 / 1 是。 */
    private Integer acceptanceVerified;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
