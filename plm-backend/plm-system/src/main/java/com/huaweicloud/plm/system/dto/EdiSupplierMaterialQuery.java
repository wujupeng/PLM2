package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 供应商供货关系分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class EdiSupplierMaterialQuery extends PageQuery {

    /** 供应商编码。 */
    private String supplierCode;

    /** 物料编码。 */
    private String materialCode;

    /** 状态：1 启用 / 0 停用。 */
    private Integer status;
}
