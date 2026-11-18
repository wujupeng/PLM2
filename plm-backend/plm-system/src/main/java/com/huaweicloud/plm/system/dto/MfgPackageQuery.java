package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 包装箱分页查询条件（N8，DEV-089）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MfgPackageQuery extends PageQuery {

    /** 包装编号。 */
    private String packageNo;

    /** 箱码/托盘码。 */
    private String packageCode;

    /** 包装层级：INNER/OUTER/PALLET。 */
    private String packageLevel;

    /** 生产批次号。 */
    private String batchNo;

    /** 产品编码。 */
    private String productCode;

    /** 客户编码。 */
    private String customerCode;

    /** 包装状态：OPEN/SEALED/SHIPPED。 */
    private String packageStatus;
}
