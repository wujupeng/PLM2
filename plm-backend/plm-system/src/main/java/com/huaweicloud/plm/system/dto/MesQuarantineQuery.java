package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 隔离记录分页查询条件。
 * keyword 匹配 quarantineNo/materialCode/materialName/sourceNo。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesQuarantineQuery extends PageQuery {

    /** 隔离状态。 */
    private String quarantineStatus;

    /** 隔离类型。 */
    private String quarantineType;

    /** 物料编码。 */
    private String materialCode;
}
