package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 单据状态定义（G1-N6 公共平台底座—通用能力，WBS T102 单据状态机）：
 * 按「单据类型 + 状态编码」登记状态语义，覆盖草稿、提交、审核、执行、关闭、作废、红冲等状态，
 * 通过 isInitial/isFinal 标识起始态与终态，allowEdit/allowDelete 控制该状态下是否可编辑、可删除。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_doc_state_def")
public class SysDocStateDef extends BaseEntity {

    /** 单据类型。 */
    private String docType;

    /** 状态编码（同一单据类型内唯一）。 */
    private String stateCode;

    /** 状态名称。 */
    private String stateName;

    /** 状态类型：DRAFT/SUBMITTED/APPROVED/EXECUTING/CLOSED/VOID/REVERSED，默认 DRAFT。 */
    private String stateType;

    /** 是否起始态：0 否/1 是。 */
    private Integer isInitial;

    /** 是否终态：0 否/1 是。 */
    private Integer isFinal;

    /** 是否允许编辑：0 否/1 是。 */
    private Integer allowEdit;

    /** 是否允许删除：0 否/1 是。 */
    private Integer allowDelete;

    /** 排序号。 */
    private Integer sortNo;

    /** 状态：ACTIVE/DISABLED，默认 ACTIVE。 */
    private String stateStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
