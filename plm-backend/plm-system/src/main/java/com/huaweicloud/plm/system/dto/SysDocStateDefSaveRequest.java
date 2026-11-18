package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 单据状态定义保存请求（G1-N6 WBS T102 单据状态机）。
 */
@Data
public class SysDocStateDefSaveRequest {

    /** 单据类型。 */
    @NotBlank(message = "单据类型不能为空")
    private String docType;

    /** 状态编码（为空时自动生成）。 */
    private String stateCode;

    /** 状态名称。 */
    @NotBlank(message = "状态名称不能为空")
    private String stateName;

    /** 状态类型：DRAFT/SUBMITTED/APPROVED/EXECUTING/CLOSED/VOID/REVERSED，为空默认 DRAFT。 */
    private String stateType;

    /** 是否起始态：0 否/1 是，为空默认 0。 */
    private Integer isInitial;

    /** 是否终态：0 否/1 是，为空默认 0。 */
    private Integer isFinal;

    /** 是否允许编辑：0 否/1 是，为空默认 0。 */
    private Integer allowEdit;

    /** 是否允许删除：0 否/1 是，为空默认 0。 */
    private Integer allowDelete;

    /** 排序号，为空默认 0。 */
    private Integer sortNo;

    /** 状态：ACTIVE/DISABLED，为空默认 ACTIVE。 */
    private String stateStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
