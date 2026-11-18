package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 在制品看板记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_kanban_wip")
public class MesKanbanWip extends BaseEntity {

    /** 在制品单号。 */
    private String wipNo;

    /** 工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 产线编码。 */
    private String lineCode;

    /** 工序编码。 */
    private String processCode;

    /** 在制数量。 */
    private BigDecimal wipQty;

    /** 计量单位。 */
    private String uom;

    /** 统计时间。 */
    private LocalDateTime statTime;

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
