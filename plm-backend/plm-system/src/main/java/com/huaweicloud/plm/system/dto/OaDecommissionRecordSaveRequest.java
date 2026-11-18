package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 完成授权和资源回收保存请求（OA-DEV-120）。
 */
@Data
public class OaDecommissionRecordSaveRequest {

    /** 回收编号。 */
    private String decommissionNo;

    /** 回收名称。 */
    @NotBlank(message = "回收名称不能为空")
    private String decommissionName;

    /** 资源类型：ACCESS/LICENSE。 */
    private String resourceType;

    /** 资源说明。 */
    private String resourceDesc;

    /** 授权撤销范围。 */
    private String revokeScope;

    /** 是否已批准：0 否 / 1 是。 */
    private Integer approved;

    /** 批准人。 */
    private String approver;

    /** 回收状态：PENDING/EXECUTED。 */
    private String decommissionStatus;

    /** 执行时间（yyyy-MM-dd HH:mm:ss）。 */
    private String executeTime;

    /** 是否保留备份：0 否 / 1 是。 */
    private Integer backupKept;

    /** 风险说明。 */
    private String riskNote;

    /** 操作人。 */
    private String operatorName;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
