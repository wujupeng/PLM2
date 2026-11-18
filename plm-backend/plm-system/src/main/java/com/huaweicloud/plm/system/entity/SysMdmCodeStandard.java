package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 主数据平台—编码标准（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 登记各主数据域的编码规则与示例，统一跨系统编码口径。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_mdm_code_standard")
public class SysMdmCodeStandard extends BaseEntity {

    /** 编码标准编号（唯一，支持人工指定）。 */
    private String standardNo;

    /** 主数据域编码。 */
    private String domainCode;

    /** 标准编码。 */
    private String standardCode;

    /** 标准名称。 */
    private String standardName;

    /** 编码模板。 */
    private String codePattern;

    /** 流水号位数，默认 4。 */
    private Integer seqLength;

    /** 重置周期，默认 NONE。 */
    private String resetCycle;

    /** 示例值。 */
    private String sampleValue;

    /** 标准状态，默认 ACTIVE。 */
    private String standardStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
