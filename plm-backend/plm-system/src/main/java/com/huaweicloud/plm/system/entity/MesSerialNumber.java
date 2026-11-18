package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 序列号台账。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_serial_number")
public class MesSerialNumber extends BaseEntity {

    /** 序列号。 */
    private String serialNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 批次号。 */
    private String batchNo;

    /** 序列号状态，默认 CREATED。 */
    private String serialStatus;

    /** 工单号。 */
    private String workOrderNo;

    /** 生产时间。 */
    private LocalDateTime produceTime;

    /** 发货时间。 */
    private LocalDateTime shipTime;

    /** 客户编码。 */
    private String customerCode;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
