package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * EDI 报文映射分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class EdiMessageMapQuery extends PageQuery {

    /** 伙伴编码，* 表示通用。 */
    private String partnerCode;

    /** 交易代码。 */
    private String transCode;

    /** 作用域：HEADER/LINE。 */
    private String scope;

    /** 转换类型：DIRECT/DICT/DATE/CONST。 */
    private String transformType;

    /** 状态：1 启用 / 0 停用。 */
    private Integer status;
}
