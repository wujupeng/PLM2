package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** 迁移任务保存请求（N9，DEV-098）。 */
@Data
public class IntMigrationTaskSaveRequest {

    /** 任务编号，为空时自动生成。 */
    private String taskNo;

    /** 迁移范围：MATERIAL/BOM/SUPPLIER/PRODUCT/DOCUMENT/TRACE。 */
    @NotBlank(message = "迁移范围不能为空")
    private String scope;

    /** 来源系统。 */
    private String sourceSystem;

    /** 目标表名。 */
    private String targetTable;

    /** 源数据条数，为空时取 0。 */
    private Long sourceCount;

    /** 失败条数，为空时取 0。 */
    private Long failCount;

    /** 跳过条数，为空时取 0。 */
    private Long skipCount;

    private String remark;
}
