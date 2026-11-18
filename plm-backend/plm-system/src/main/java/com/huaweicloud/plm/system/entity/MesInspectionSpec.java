package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 检验规范。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_inspection_spec")
public class MesInspectionSpec extends BaseEntity {

    /** 规范编号。 */
    private String specNo;

    /** 规范名称。 */
    private String specName;

    /** 规范类型，默认 INCOMING。 */
    private String specType;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 工序编码。 */
    private String processCode;

    /** 检验项目。 */
    private String inspectionItem;

    /** 检验方法。 */
    private String inspectionMethod;

    /** 标准值。 */
    private String standardValue;

    /** 上限。 */
    private BigDecimal upperLimit;

    /** 下限。 */
    private BigDecimal lowerLimit;

    /** 抽样方案。 */
    private String samplePlan;

    /** AQL。 */
    private String aql;

    /** 规范版本。 */
    private String specVersion;

    /** 规范状态，默认 DRAFT。 */
    private String specStatus;

    /** 生效日期。 */
    private LocalDateTime effectiveDate;

    /** 失效日期。 */
    private LocalDateTime expireDate;

    /** 责任人。 */
    private String owner;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
