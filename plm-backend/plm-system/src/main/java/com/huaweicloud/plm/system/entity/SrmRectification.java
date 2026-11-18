package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * SRM 供应商质量—整改跟踪：登记整改单号、来源单号、供应商与物料、问题描述与整改措施、
 * 责任人、计划与完成日期、验证人与验证结论及整改状态，支撑整改闭环追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_rectification")
public class SrmRectification extends BaseEntity {

    /** 整改单号（为空时自动生成）。 */
    private String rectificationNo;

    /** 来源单号。 */
    private String sourceNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 问题描述。 */
    private String issueDesc;

    /** 整改措施。 */
    private String rectifyAction;

    /** 责任人。 */
    private String responsible;

    /** 计划完成日期。 */
    private LocalDate planDate;

    /** 实际完成日期。 */
    private LocalDate completeDate;

    /** 验证人。 */
    private String verifyBy;

    /** 验证日期。 */
    private LocalDate verifyDate;

    /** 验证结论。 */
    private String verifyResult;

    /** 整改状态，默认 PENDING。 */
    private String rectificationStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
