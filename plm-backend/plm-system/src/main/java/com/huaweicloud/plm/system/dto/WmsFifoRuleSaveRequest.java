package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * FIFO 规则保存请求（N7，DEV-079）。
 */
@Data
public class WmsFifoRuleSaveRequest {

    @NotBlank(message = "规则编码不能为空")
    private String ruleCode;

    @NotBlank(message = "规则名称不能为空")
    private String ruleName;

    /** 适用范围：GLOBAL/MATERIAL/CUSTOMER。 */
    private String scope;

    /** 客户编码（客户特定策略）。 */
    private String customerCode;

    /** 物料编码（物料策略）。 */
    private String materialCode;

    /** FIFO 判定依据：INBOUND_DATE/RELEASE_DATE/BATCH_DATE/PRODUCTION_DATE。 */
    private String fifoBasis;

    /** 是否启用超期校验：0/1。 */
    private Integer expiryCheck;

    /** 临期预警天数。 */
    private Integer expiryWarnDays;

    /** 是否允许例外：0/1。 */
    private Integer allowException;

    /** 例外授权角色。 */
    private String exceptionRole;

    /** 优先级（值越小越优先）。 */
    private Integer priority;

    /** 状态：1 启用 / 0 停用。 */
    private Integer status;

    private String remark;
}
