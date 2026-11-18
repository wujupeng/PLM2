package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 良率看板记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_kanban_yield")
public class MesKanbanYield extends BaseEntity {

    /** 良率看板单号。 */
    private String yieldNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 产线编码。 */
    private String lineCode;

    /** 班次编码。 */
    private String shiftCode;

    /** 投入数量。 */
    private BigDecimal inputQty;

    /** 合格数量。 */
    private BigDecimal qualifiedQty;

    /** 不合格数量。 */
    private BigDecimal unqualifiedQty;

    /** 良率。 */
    private BigDecimal yieldRate;

    /** 统计日期。 */
    private LocalDateTime statDate;

    /** 记录状态，默认 DRAFT。 */
    private String recordStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
