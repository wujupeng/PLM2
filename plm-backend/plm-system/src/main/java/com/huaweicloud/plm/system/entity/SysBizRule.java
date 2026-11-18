package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 业务规则定义（G1-N6 公共平台底座—通用能力 WBS T104 业务规则引擎）：
 * 支撑交期、最小起订量、批量、替代料、FIFO、质量放行、信用额度等规则配置。
 * 规则按规则类型与业务模块登记，priority 数值越小优先级越高，ruleExpr 保存可读表达式便于人工核查。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_biz_rule")
public class SysBizRule extends BaseEntity {

    /** 规则编号（唯一，支持人工指定）。 */
    private String ruleNo;

    /** 规则编码，供规则参数按规则关联。 */
    private String ruleCode;

    /** 规则名称。 */
    private String ruleName;

    /** 规则类型：LEAD_TIME/MOQ/LOT_SIZE/SUBSTITUTE/FIFO/QUALITY_RELEASE/CREDIT_LIMIT，默认 LEAD_TIME。 */
    private String ruleType;

    /** 业务模块：PLM/ERP/SRM/MES/WMS/OA。 */
    private String bizModule;

    /** 规则表达式（可读文本，便于人工核查）。 */
    private String ruleExpr;

    /** 优先级，数值越小越优先，默认 100。 */
    private Integer priority;

    /** 规则状态：ACTIVE/DISABLED，默认 ACTIVE。 */
    private String ruleStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
