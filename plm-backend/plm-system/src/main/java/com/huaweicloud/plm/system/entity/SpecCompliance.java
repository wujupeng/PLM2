package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 环保合规记录（DEV-045）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("spec_compliance")
public class SpecCompliance extends BaseEntity {

    /** 合规记录编码。 */
    private String complianceCode;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 合规要求类型：rohs/elv/reach/other 等。 */
    private String requirementType;

    /** 风险等级：low/middle/high。 */
    private String riskLevel;

    /** 供应商编码。 */
    private String supplierCode;

    /** 声明编号。 */
    private String declarationNo;

    /** 声明文件。 */
    private String declarationFile;

    /** 生效日期。 */
    private LocalDate effectiveDate;

    /** 失效日期。 */
    private LocalDate expireDate;

    /** 状态：pending/valid/expired/missing。 */
    private String status;

    /** 最近校验时间。 */
    private LocalDateTime checkedAt;

    private String remark;
}
