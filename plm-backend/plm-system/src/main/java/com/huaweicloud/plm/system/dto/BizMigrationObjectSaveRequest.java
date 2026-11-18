package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 迁移对象目录保存请求（OA-DEV-095）。
 */
@Data
public class BizMigrationObjectSaveRequest {

    /** 对象编码。 */
    private String objectCode;

    /** 对象名称。 */
    @NotBlank(message = "对象名称不能为空")
    private String objectName;

    /** 源系统。 */
    private String sourceSystem;

    /** 迁移方式：API/DB/FILE/EXPORT。 */
    private String sourceType;

    /** 源位置。 */
    private String sourceLocation;

    /** 目标对象。 */
    private String targetObject;

    /** 源记录数量。 */
    private Long sourceCount;

    /** 是否必须迁移。 */
    private Boolean migrateRequired;

    /** 迁移状态。 */
    private String status;

    /** 备注。 */
    private String remark;
}
