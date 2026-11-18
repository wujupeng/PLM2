package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 换线换型单。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_changeover")
public class MesChangeover extends BaseEntity {

    /** 换线换型单号。 */
    private String changeoverNo;

    /** 工单号。 */
    private String workOrderNo;

    /** 产线编码。 */
    private String lineCode;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 换型类型，默认 MODEL。 */
    private String changeoverType;

    /** 开始时间。 */
    private LocalDateTime startTime;

    /** 结束时间。 */
    private LocalDateTime endTime;

    /** 耗时分钟。 */
    private BigDecimal durationMinutes;

    /** 换型状态，默认 DRAFT。 */
    private String changeoverStatus;

    /** 操作员。 */
    private String operator;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
