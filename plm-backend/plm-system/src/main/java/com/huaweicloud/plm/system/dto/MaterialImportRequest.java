package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.List;

/**
 * 物料批量导入请求。
 */
@Data
public class MaterialImportRequest {

    /** 源文件名称，用于溯源。 */
    private String sourceFile;

    private List<MaterialImportRow> rows;
}
