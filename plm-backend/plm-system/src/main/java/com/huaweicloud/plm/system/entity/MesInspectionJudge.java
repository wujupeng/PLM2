package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 检验判定。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_inspection_judge")
public class MesInspectionJudge extends BaseEntity {

    /** 判定单号。 */
    private String judgeNo;

    /** 来源类型，默认 INCOMING。 */
    private String sourceType;

    /** 来源单号。 */
    private String sourceNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 批次号。 */
    private String batchNo;

    /** 判定结果，默认 PASS。 */
    private String judgeResult;

    /** 判定状态，默认 DRAFT。 */
    private String judgeStatus;

    /** 判定数量。 */
    private BigDecimal judgeQty;

    /** 合格数量。 */
    private BigDecimal qualifiedQty;

    /** 不合格数量。 */
    private BigDecimal unqualifiedQty;

    /** 判定意见。 */
    private String judgeOpinion;

    /** 处置方式。 */
    private String disposition;

    /** 判定人。 */
    private String judgeBy;

    /** 判定时间。 */
    private LocalDateTime judgeTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
