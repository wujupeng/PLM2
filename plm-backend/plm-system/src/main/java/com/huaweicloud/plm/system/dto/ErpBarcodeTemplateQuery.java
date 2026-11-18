package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 标签模板分页查询条件（对应 WBS G3-N7a ERP 条码管理）。
 * keyword 匹配 templateCode/templateName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpBarcodeTemplateQuery extends PageQuery {

    /** 模板类型。 */
    private String templateType;

    /** 模板状态。 */
    private String templateStatus;
}
