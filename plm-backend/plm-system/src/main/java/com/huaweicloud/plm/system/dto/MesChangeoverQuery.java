package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 换线换型单分页查询条件。
 * keyword 匹配 changeoverNo/workOrderNo/lineCode/materialCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesChangeoverQuery extends PageQuery {

    /** 换型状态。 */
    private String changeoverStatus;

    /** 换型类型。 */
    private String changeoverType;

    /** 产线编码。 */
    private String lineCode;

    /** 物料编码。 */
    private String materialCode;
}
