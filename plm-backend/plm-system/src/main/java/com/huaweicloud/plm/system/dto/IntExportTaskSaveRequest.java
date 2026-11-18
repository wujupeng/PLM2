package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** 导出任务保存请求（N9，DEV-099）。 */
@Data
public class IntExportTaskSaveRequest {

    /** 任务编号，为空时自动生成。 */
    private String taskNo;

    /** 导出范围：MASTER_DATA/BOM/TRACE/ATTACHMENT/ALL。 */
    @NotBlank(message = "导出范围不能为空")
    private String scope;

    /** 导出格式：CSV/EXCEL/JSON，为空时默认 CSV。 */
    private String exportFormat;

    /** 是否包含附件：1 包含 / 0 不包含，为空时取 0。 */
    private Integer includeAttachment;

    private String remark;
}
