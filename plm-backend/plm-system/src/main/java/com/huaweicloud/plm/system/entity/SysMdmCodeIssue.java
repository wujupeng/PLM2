package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 主数据平台—编码发放（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 登记主数据编码的实际发放流水，支持编码回收与追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_mdm_code_issue")
public class SysMdmCodeIssue extends BaseEntity {

    /** 编码发放编号（唯一）。 */
    private String issueNo;

    /** 主数据域编码。 */
    private String domainCode;

    /** 编码标准编码。 */
    private String standardCode;

    /** 主数据编码。 */
    private String masterCode;

    /** 编码流水号。 */
    private Long seqValue;

    /** 发放时间。 */
    private LocalDateTime issueTime;

    /** 发放人名称。 */
    private String issuedBy;

    /** 发放状态，默认 ISSUED。 */
    private String issueStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
