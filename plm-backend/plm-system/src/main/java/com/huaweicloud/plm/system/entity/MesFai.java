package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 首件确认。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_fai")
public class MesFai extends BaseEntity {

    /** 首件确认单号。 */
    private String faiNo;

    /** 工单号。 */
    private String workOrderNo;

    /** 工序编码。 */
    private String processCode;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 设备编码。 */
    private String equipmentCode;

    /** 检验人。 */
    private String inspector;

    /** 检验时间。 */
    private LocalDateTime inspectTime;

    /** 首件结果，默认 PASS。 */
    private String faiResult;

    /** 首件状态，默认 PENDING。 */
    private String faiStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
