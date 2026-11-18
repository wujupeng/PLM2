package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * ERP 业务单据追踪—单据追溯（对应 WBS G3-N7a ERP 业务单据追踪）：
 * 登记追溯号、单据类型与编号、来源/目标单据信息、追溯层级与业务/审批状态，支撑单据全链路追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_doc_track")
public class ErpDocTrack extends BaseEntity {

    /** 追溯号（唯一，为空时自动生成）。 */
    private String traceNo;

    /** 单据类型。 */
    private String docType;

    /** 单据编号。 */
    private String docNo;

    /** 单据标题。 */
    private String docTitle;

    /** 来源单据类型。 */
    private String sourceDocType;

    /** 来源单据编号。 */
    private String sourceDocNo;

    /** 目标单据类型。 */
    private String targetDocType;

    /** 目标单据编号。 */
    private String targetDocNo;

    /** 追溯层级，默认 1。 */
    private Integer trackLevel;

    /** 业务状态，默认 OPEN。 */
    private String bizStatus;

    /** 审批状态，默认 NONE。 */
    private String approvalStatus;

    /** 审批流程实例编号。 */
    private String approvalInstanceNo;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
