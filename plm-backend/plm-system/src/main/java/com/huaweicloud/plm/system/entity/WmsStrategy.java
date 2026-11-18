package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * WMS 仓储基础数据—作业策略：登记策略编码、名称、类型、优先级、先进先出标识、
 * 规则内容与策略状态及所属组织，支撑入库上架等作业的策略配置与追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_strategy")
public class WmsStrategy extends BaseEntity {

    /** 策略编码（为空时自动生成）。 */
    private String strategyCode;

    /** 策略名称。 */
    private String strategyName;

    /** 策略类型，默认 PUTAWAY。 */
    private String strategyType;

    /** 优先级，默认 0。 */
    private Integer priority;

    /** 先进先出标识，默认 0。 */
    private Integer fifoFlag;

    /** 规则内容。 */
    private String ruleContent;

    /** 策略状态，默认 DRAFT。 */
    private String strategyStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
