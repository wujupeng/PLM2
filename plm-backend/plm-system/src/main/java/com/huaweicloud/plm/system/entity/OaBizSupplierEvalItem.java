package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 供方考评明细项（OA-DEV-068）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_biz_supplier_eval_item")
public class OaBizSupplierEvalItem extends BaseEntity {

    /** 所属考评单 ID。 */
    private Long evaluationId;

    private String itemCode;

    private String itemName;

    private BigDecimal weight;

    private BigDecimal maxScore;

    private BigDecimal score;

    private String scoreBasis;

    private Integer sortNo;

    private String remark;
}
