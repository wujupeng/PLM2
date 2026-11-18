package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 包装规则（N8，DEV-089）：包装数量、内外箱关系、箱码/托盘码与标签规则。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mfg_package_rule")
public class MfgPackageRule extends BaseEntity {

    /** 规则编号（唯一）。 */
    private String ruleNo;

    /** 产品编码。 */
    private String productCode;

    /** 包装层级：INNER/OUTER/PALLET。 */
    private String packageLevel;

    /** 单包数量。 */
    private BigDecimal packageQty;

    /** 每箱内装数量。 */
    private BigDecimal innerQtyPerBox;

    /** 每托盘箱数。 */
    private BigDecimal boxPerPallet;

    /** 标签模板编码。 */
    private String labelTemplateCode;

    /** 客户编码（客户特定包装规则）。 */
    private String customerCode;

    /** 状态：enabled/disabled。 */
    private String status;

    private String remark;
}
