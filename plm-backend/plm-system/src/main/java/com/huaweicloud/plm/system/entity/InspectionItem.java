package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 检验项目明细（DEV-048）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("inspection_item")
public class InspectionItem extends BaseEntity {

    /** 所属检验规范 ID。 */
    private Long specId;

    /** 序号。 */
    private Integer seqNo;

    /** 项目编码。 */
    private String itemCode;

    /** 项目名称。 */
    private String itemName;

    /** 检验方法。 */
    private String inspectionMethod;

    /** 检验设备。 */
    private String equipment;

    /** 单位。 */
    private String unit;

    /** 标准值。 */
    private String standardValue;

    /** 上限。 */
    private BigDecimal upperLimit;

    /** 下限。 */
    private BigDecimal lowerLimit;

    /** 判定规则。 */
    private String verdictRule;

    /** 是否关键项：0-否 1-是。 */
    private Integer keyItem;

    private String remark;
}
