package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 集成监控保存请求（G1-N1 集成平台，WBS T009）。
 * 健康度与告警由调用计数按失败率阈值推导，不在请求中传入。
 */
@Data
public class SysIntegrationMonitorSaveRequest {

    /** 监控编号，为空时自动生成。 */
    private String monitorNo;

    /** 监控日期（yyyy-MM-dd），为空时取当天。 */
    private String monitorDay;

    /** 统计小时（0-23），为空时取 0。 */
    private Integer statHour;

    /** 所属系统编码。 */
    @NotBlank(message = "所属系统不能为空")
    private String systemCode;

    /** 目标类型：API/EVENT，为空时取 API。 */
    private String targetType;

    /** 目标编码。 */
    private String targetCode;

    /** 目标名称。 */
    private String targetName;

    /** 调用总数，为空时取 0。 */
    private Integer totalCount;

    /** 成功数，为空时取 0。 */
    private Integer successCount;

    /** 失败数，为空时取 0。 */
    private Integer failCount;

    /** 平均耗时（毫秒），为空时取 0。 */
    private Integer avgCostMs;

    /** 最大耗时（毫秒），为空时取 0。 */
    private Integer maxCostMs;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
