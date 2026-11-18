package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * ASN 明细行（N6，DEV-072）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("edi_asn_line")
public class EdiAsnLine extends BaseEntity {

    /** ASN 主键。 */
    private Long asnId;

    /** ASN 编号。 */
    private String asnNo;

    /** 行号。 */
    private Integer lineNo;

    /** 物料编码。 */
    private String materialCode;

    /** 数量。 */
    private BigDecimal qty;

    /** 单位。 */
    private String unit;

    /** 批次号。 */
    private String batchNo;

    /** 包装编码。 */
    private String packageCode;

    /** 箱码。 */
    private String boxCode;

    private String remark;
}
