package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 工程变更执行结果。
 */
@Data
public class EcoExecuteResult {

    /** 变更单 ID。 */
    private Long ecoId;

    /** 执行状态：pending/executing/completed。 */
    private String executionStatus;

    /** 已切换明细数。 */
    private Integer switched;

    /** 待切换明细数。 */
    private Integer pending;

    /** 结果说明。 */
    private String message;
}
