package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 巡检记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_patrol_inspection")
public class MesPatrolInspection extends BaseEntity {

    /** 巡检单号。 */
    private String patrolNo;

    /** 工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 工序编码。 */
    private String processCode;

    /** 工序名称。 */
    private String processName;

    /** 设备编码。 */
    private String equipmentCode;

    /** 检验项目。 */
    private String inspectionItem;

    /** 标准值。 */
    private String standardValue;

    /** 实测值。 */
    private String actualValue;

    /** 检验结果。 */
    private String inspectionResult;

    /** 检验状态，默认 PENDING。 */
    private String inspectionStatus;

    /** 巡检员。 */
    private String inspector;

    /** 巡检时间。 */
    private LocalDateTime inspectionTime;

    /** 班次编码。 */
    private String shiftCode;

    /** 判定单号。 */
    private String judgeNo;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
