package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * MES 工时记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_labor_hour")
public class MesLaborHour extends BaseEntity {

    /** 工时单号。 */
    private String laborNo;

    /** 工单号。 */
    private String workOrderNo;

    /** 派工单号。 */
    private String dispatchNo;

    /** 工序编码。 */
    private String processCode;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 作业人员。 */
    private String worker;

    /** 班次编码。 */
    private String shiftCode;

    /** 工作日期。 */
    private LocalDateTime workDate;

    /** 正常工时。 */
    private BigDecimal normalHours;

    /** 加班工时。 */
    private BigDecimal overtimeHours;

    /** 合计工时。 */
    private BigDecimal totalHours;

    /** 工时状态，默认 DRAFT。 */
    private String laborStatus;

    /** 确认时间。 */
    private LocalDateTime confirmTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
