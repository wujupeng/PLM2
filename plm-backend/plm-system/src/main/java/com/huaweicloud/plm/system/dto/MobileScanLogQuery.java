package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 扫码操作日志分页查询条件（G1-N6 WBS T106 移动端与PDA）。
 * startDate/endDate 作用于扫码时间。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MobileScanLogQuery extends PageQuery {

    /** 场景编码。 */
    private String sceneCode;

    /** 扫码类型。 */
    private String scanType;

    /** 扫码结果：SUCCESS/FAIL。 */
    private String scanResult;

    /** 条码（模糊）。 */
    private String barcode;

    /** 设备编号。 */
    private String deviceNo;

    /** 起始日期（yyyy-MM-dd），作用于扫码时间。 */
    private String startDate;

    /** 结束日期（yyyy-MM-dd），作用于扫码时间。 */
    private String endDate;
}
