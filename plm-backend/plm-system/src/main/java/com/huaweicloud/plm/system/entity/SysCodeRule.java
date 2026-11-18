package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 编码规则（G1-N6 公共平台底座—通用能力 WBS T105 数据质量控制）：
 * 登记目标实体的编码前缀、日期段、流水号长度与重置周期，并维护当前流水值，
 * 供各系统统一生成合规编码，避免各系统自造编码规则。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_code_rule")
public class SysCodeRule extends BaseEntity {

    /** 编码规则编号（唯一，支持人工指定）。 */
    private String codeNo;

    /** 编码规则编码。 */
    private String codeCode;

    /** 编码规则名称。 */
    private String codeName;

    /** 目标实体。 */
    private String targetEntity;

    /** 编码前缀。 */
    private String prefix;

    /** 日期段格式：yyyyMMdd/yyyyMM/yyyy 等，为空则不拼接日期段。 */
    private String datePattern;

    /** 流水号长度，默认 4。 */
    private Integer seqLength;

    /** 重置周期：NONE/DAILY/MONTHLY/YEARLY，默认 NONE。 */
    private String resetCycle;

    /** 当前流水值，默认 0。 */
    private Integer currentSeq;

    /** 规则状态：ACTIVE/DISABLED，默认 ACTIVE。 */
    private String codeStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
