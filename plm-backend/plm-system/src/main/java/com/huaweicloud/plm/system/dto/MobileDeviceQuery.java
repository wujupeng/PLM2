package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * PDA 设备分页查询条件（G1-N6 WBS T106 移动端与PDA）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MobileDeviceQuery extends PageQuery {

    /** 设备类型：PDA/PHONE/SCANNER/TABLET。 */
    private String deviceType;

    /** 设备状态：ACTIVE/OFFLINE/DISABLED。 */
    private String deviceStatus;
}
