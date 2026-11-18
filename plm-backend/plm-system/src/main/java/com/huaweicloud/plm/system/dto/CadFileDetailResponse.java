package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.CadAttrMapping;
import com.huaweicloud.plm.system.entity.CadExtractError;
import com.huaweicloud.plm.system.entity.CadFile;
import lombok.Data;

import java.util.List;

/**
 * CAD 文件明细返回组合。
 */
@Data
public class CadFileDetailResponse {

    /** CAD 文件主档。 */
    private CadFile cadFile;

    /** 属性提取异常列表。 */
    private List<CadExtractError> errors;

    /** 当前启用的属性映射列表。 */
    private List<CadAttrMapping> mappings;
}
