package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * CAD 文件分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class CadFileQuery extends PageQuery {

    /** CAD 文件编号。 */
    private String cadNo;

    /** 文件格式。 */
    private String fileFormat;

    /** 关联物料编码。 */
    private String materialCode;

    /** 关联产品编码。 */
    private String productCode;

    /** 属性提取状态：pending/success/partial/failed。 */
    private String extractStatus;
}
