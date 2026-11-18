package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 架构组件（G1-N7 公共平台底座—治理中心 WBS T005 总体架构）：
 * 登记总体架构组件（应用/数据/技术/安全分层）及其所属系统域、组件类型、技术栈、
 * 部署单元与运行状态，为六系统边界、部署拓扑、容灾与扩展策略统一治理提供基线。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_gov_arch_component")
public class SysGovArchComponent extends BaseEntity {

    /** 组件编号（唯一，支持人工指定）。 */
    private String componentNo;

    /** 组件编码。 */
    private String componentCode;

    /** 组件名称。 */
    private String componentName;

    /** 架构分层：APPLICATION/DATA/TECHNOLOGY/SECURITY 等，默认 APPLICATION。 */
    private String archLayer;

    /** 系统域。 */
    private String systemDomain;

    /** 组件类型。 */
    private String componentType;

    /** 技术栈。 */
    private String techStack;

    /** 部署单元。 */
    private String deployUnit;

    /** 组件状态：ACTIVE/INACTIVE 等，默认 ACTIVE。 */
    private String componentStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
