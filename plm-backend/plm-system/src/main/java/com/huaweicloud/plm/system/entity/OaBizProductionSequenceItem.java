package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 生产顺序表明细行（OA-DEV-065）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_biz_production_sequence_item")
public class OaBizProductionSequenceItem extends BaseEntity {

    /** 所属生产顺序表 ID。 */
    private Long sequenceId;

    /** 行号。 */
    private Integer lineNo;

    private String orderNo;

    private String materialCode;

    private String materialName;

    private BigDecimal planQty;

    private LocalDateTime planStart;

    private LocalDateTime planEnd;

    private String workstation;

    private Integer priorityNo;

    private String remark;
}
