package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 执行最终全量及增量迁移保存请求（OA-DEV-115）。
 */
@Data
public class OaFinalMigrationSaveRequest {

    /** 迁移编号。 */
    private String migNo;

    /** 迁移名称。 */
    @NotBlank(message = "迁移名称不能为空")
    private String migName;

    /** 迁移类型：FULL/INCREMENT。 */
    private String migType;

    /** 抽取范围。 */
    private String sourceScope;

    /** 抽取开始时间（yyyy-MM-dd HH:mm:ss）。 */
    private String extractStart;

    /** 抽取结束时间（yyyy-MM-dd HH:mm:ss）。 */
    private String extractEnd;

    /** 导入成功条数。 */
    private Long importedCount;

    /** 导入失败条数。 */
    private Long failedCount;

    /** 附件数量。 */
    private Long attachmentCount;

    /** 校验状态：PENDING/VERIFIED/EXCEPTION。 */
    private String verifyStatus;

    /** 校验是否通过：1 通过，0 不通过。 */
    private Integer verifyPass;

    /** 迁移状态：PENDING/SUCCESS/PARTIAL/FAILED。 */
    private String migStatus;

    /** 操作人。 */
    private String operatorName;

    /** 迁移时间（yyyy-MM-dd HH:mm:ss）。 */
    private String migTime;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
