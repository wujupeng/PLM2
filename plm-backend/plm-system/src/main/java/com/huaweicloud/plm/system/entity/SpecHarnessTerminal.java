package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 线束端子明细（DEV-044）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("spec_harness_terminal")
public class SpecHarnessTerminal extends BaseEntity {

    /** 所属线束 ID。 */
    private Long harnessId;

    /** 序号。 */
    private Integer seqNo;

    /** 导线物料编码。 */
    private String wireMaterialCode;

    /** 导线规格。 */
    private String wireSpec;

    /** 导线颜色。 */
    private String wireColor;

    /** 导线长度。 */
    private BigDecimal wireLength;

    /** 端子物料编码。 */
    private String terminalMaterialCode;

    /** 端子名称。 */
    private String terminalName;

    /** 护套物料编码。 */
    private String sheathMaterialCode;

    /** 护套名称。 */
    private String sheathName;

    /** 起始连接器。 */
    private String fromConnector;

    /** 起始针脚。 */
    private String fromPin;

    /** 目标连接器。 */
    private String toConnector;

    /** 目标针脚。 */
    private String toPin;

    /** 装配要求。 */
    private String assembleRequirement;

    private String remark;
}
