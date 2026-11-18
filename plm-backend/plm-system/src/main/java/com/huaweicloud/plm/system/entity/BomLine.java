package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * BOM 行（父件与子件的用量关系）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("bom_line")
public class BomLine extends BaseEntity {

    /** 所属 BOM 头 ID。 */
    private Long headerId;

    /** 行号。 */
    private Integer lineNo;

    /** 父件物料编码。 */
    private String parentMaterialCode;

    /** 子件物料编码。 */
    private String childMaterialCode;

    /** 子件物料名称。 */
    private String childMaterialName;

    /** 用量。 */
    private BigDecimal qty;

    /** 计量单位。 */
    private String unit;

    /** 位号/序号。 */
    private String itemSeq;

    /** 是否允许替代：0=否，1=是。 */
    private Integer substituteAllowed;

    /** 生效日期。 */
    private LocalDate validFrom;

    /** 失效日期。 */
    private LocalDate validTo;

    private String remark;
}
