package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 追踪链接（G1-N7 公共平台底座—治理中心 WBS T004 需求追踪）：
 * 以 reqCode 关联需求，登记追踪链接类型（功能/数据/API/测试用例/验收证据等）
 * 与目标引用、名称，构成需求到交付的双向追踪矩阵行。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_gov_trace_link")
public class SysGovTraceLink extends BaseEntity {

    /** 追踪链接编号（唯一，支持人工指定）。 */
    private String linkNo;

    /** 关联需求编码。 */
    private String reqCode;

    /** 链接类型：FUNCTION/DATA/API/TEST/EVIDENCE 等，默认 FUNCTION。 */
    private String linkType;

    /** 目标引用（如功能编码、接口路径、用例编号）。 */
    private String targetRef;

    /** 目标名称。 */
    private String targetName;

    /** 链接说明。 */
    private String linkDesc;

    /** 链接状态：ACTIVE/INACTIVE 等，默认 ACTIVE。 */
    private String linkStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
