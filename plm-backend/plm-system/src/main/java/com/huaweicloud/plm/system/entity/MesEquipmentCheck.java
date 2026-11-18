package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 设备点检记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_equipment_check")
public class MesEquipmentCheck extends BaseEntity {

    /** 点检单号。 */
    private String checkNo;

    /** 设备编码。 */
    private String equipmentCode;

    /** 设备名称。 */
    private String equipmentName;

    /** 点检类型，默认 DAILY。 */
    private String checkType;

    /** 点检项目。 */
    private String checkItem;

    /** 点检结果，默认 PASS。 */
    private String checkResult;

    /** 点检状态，默认 PENDING。 */
    private String checkStatus;

    /** 点检人。 */
    private String inspector;

    /** 点检时间。 */
    private LocalDateTime checkTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
