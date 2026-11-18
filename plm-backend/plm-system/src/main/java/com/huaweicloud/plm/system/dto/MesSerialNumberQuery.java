package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 序列号台账分页查询条件。
 * keyword 匹配 serialNo/materialCode/materialName/batchNo。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesSerialNumberQuery extends PageQuery {

    /** 序列号状态。 */
    private String serialStatus;

    /** 物料编码。 */
    private String materialCode;

    /** 批次号。 */
    private String batchNo;
}
