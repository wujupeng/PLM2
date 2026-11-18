package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 首件检验单。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_first_inspection")
public class MesFirstInspection extends BaseEntity {

    /** 首件检验单号。 */
    private String firstNo;

    /** 工单号。 */
    private String workOrderNo;

    /** 派工单号。 */
    private String dispatchNo;

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

    /** 批次号。 */
    private String batchNo;

    /** 检验项目。 */
    private String inspectionItem;

    /** 检验结果。 */
    private String inspectionResult;

    /** 检验状态，默认 PENDING。 */
    private String inspectionStatus;

    /** 检验员。 */
    private String inspector;

    /** 检验时间。 */
    private LocalDateTime inspectionTime;

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
