package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * BOM 单阶导入请求（DEV-025）。
 */
@Data
public class BomImportRequest {

    @NotBlank(message = "BOM 类型不能为空")
    private String bomType;

    /** 源文件名称，用于溯源。 */
    private String sourceFile;

    @NotBlank(message = "产品编码不能为空")
    private String productCode;

    /** 业务版本号，为空时默认 V1。 */
    private String versionNo;

    /** 状态，为空时默认 draft。 */
    private String status;

    private LocalDate effectiveFrom;

    private List<BomImportRow> rows;
}
