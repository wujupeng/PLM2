package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 检验规范（DEV-048）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("inspection_spec")
public class InspectionSpec extends BaseEntity {

    /** 规范编码。 */
    private String specCode;

    /** 规范名称。 */
    private String specName;

    /** 检验类型：iqc/ipqc/fqc/oqc。 */
    private String inspectionType;

    /** 产品编码。 */
    private String productCode;

    /** 物料编码。 */
    private String materialCode;

    /** 版本号。 */
    private String versionNo;

    /** 抽样方案。 */
    private String samplingPlan;

    /** AQL 水平。 */
    private String aqlLevel;

    /** 状态：draft/released/obsolete。 */
    private String status;

    /** 生效日期。 */
    private LocalDate effectiveDate;

    private String remark;
}
