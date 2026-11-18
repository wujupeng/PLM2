package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 包装明细（N8，DEV-089）：箱内产品清单（单件码/追溯码/物料批次）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mfg_package_item")
public class MfgPackageItem extends BaseEntity {

    /** 包装编号。 */
    private String packageNo;

    /** 序列号。 */
    private String serialNo;

    /** 追溯码。 */
    private String traceCode;

    /** 物料/产品编码。 */
    private String materialCode;

    /** 物料批次号。 */
    private String materialBatchNo;

    /** 数量。 */
    private BigDecimal quantity;

    /** 明细状态：PACKED/UNPACKED/REPLACED。 */
    private String itemStatus;

    private String remark;
}
