package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 集成监控（G1-N1 集成平台，WBS T009）：按系统/目标/小时汇总调用量与耗时，
 * 依据失败率推导健康度与告警，支撑六系统互通的可观测性。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_integration_monitor")
public class SysIntegrationMonitor extends BaseEntity {

    /** 监控编号（唯一）。 */
    private String monitorNo;

    /** 监控日期（yyyy-MM-dd）。 */
    private String monitorDay;

    /** 统计小时（0-23，0 表示按天汇总）。 */
    private Integer statHour;

    /** 所属系统编码。 */
    private String systemCode;

    /** 目标类型：API/EVENT。 */
    private String targetType;

    /** 目标编码。 */
    private String targetCode;

    /** 目标名称。 */
    private String targetName;

    /** 调用总数。 */
    private Integer totalCount;

    /** 成功数。 */
    private Integer successCount;

    /** 失败数。 */
    private Integer failCount;

    /** 平均耗时（毫秒）。 */
    private Integer avgCostMs;

    /** 最大耗时（毫秒）。 */
    private Integer maxCostMs;

    /** 健康状态：HEALTHY/WARNING/CRITICAL。 */
    private String healthStatus;

    /** 是否告警：0/1。 */
    private Integer alertFlag;

    /** 告警信息。 */
    private String alertMessage;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
