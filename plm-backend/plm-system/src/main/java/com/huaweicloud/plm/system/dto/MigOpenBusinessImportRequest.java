package com.huaweicloud.plm.system.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

/** 将标准化 JSON 记录暂存到指定未结业务迁移批次。 */
@Data
public class MigOpenBusinessImportRequest {

    @Size(max = 255, message = "来源文件名不能超过255个字符")
    private String sourceFile;

    @NotEmpty(message = "导入记录不能为空")
    @Size(max = 1000, message = "单次最多导入1000条记录")
    private List<@NotNull @Valid MigOpenBusinessImportRecord> records;
}
