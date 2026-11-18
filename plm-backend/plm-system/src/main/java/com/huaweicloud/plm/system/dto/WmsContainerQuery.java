package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 容器管理分页查询条件（对应容器管理）。
 * keyword 匹配 containerCode/containerName/barcode/currentBinCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsContainerQuery extends PageQuery {

    /** 容器类型。 */
    private String containerType;

    /** 容器状态。 */
    private String containerStatus;
}
