package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 工艺资源—工时反馈（对应 G3-N7b ERP 工艺资源—工时反馈）：
 * 登记标准/实际工时与起止时间反馈，支撑工艺资源工时追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_process_labor")
public class ErpProcessLabor extends BaseEntity {

    /** 反馈单号（唯一，为空时自动生成）。 */
    private String feedbackNo;

    /** 计划单号。 */
    private String planNo;

    /** 报工单号。 */
    private String reportNo;

    /** 资源编码。 */
    private String resourceCode;

    /** 操作工。 */
    private String operatorName;

    /** 工时类型，默认 RUN。 */
    private String laborType;

    /** 标准工时，默认 0。 */
    private BigDecimal standardHours;

    /** 实际工时，默认 0。 */
    private BigDecimal actualHours;

    /** 开始时间。 */
    private LocalDateTime startTime;

    /** 结束时间。 */
    private LocalDateTime endTime;

    /** 工时状态，默认 DRAFT。 */
    private String laborStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
