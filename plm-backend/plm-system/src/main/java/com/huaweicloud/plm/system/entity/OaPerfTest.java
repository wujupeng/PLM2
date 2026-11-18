package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 性能与容量测试（OA-DEV-108）：记录压测场景的负载模型、并发量、数据容量与目标/实际指标。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_perf_test")
public class OaPerfTest extends BaseEntity {

    /** 测试编号。 */
    private String testNo;

    /** 压测场景名称。 */
    private String sceneName;

    /** 负载模型：CONSTANT/STEP/SPIKE。 */
    private String loadModel;

    /** 并发用户数。 */
    private Integer concurrentUsers;

    /** 流程并发数。 */
    private Integer flowConcurrency;

    /** 邮件数据量。 */
    private Long mailVolume;

    /** 文档数据量。 */
    private Long docVolume;

    /** 附件容量（字节）。 */
    private Long attachCapacity;

    /** 目标 TPS。 */
    private Integer targetTps;

    /** 目标响应时间（毫秒）。 */
    private Integer targetRtMs;

    /** 实际 TPS。 */
    private Integer actualTps;

    /** 实际响应时间（毫秒）。 */
    private Integer actualRtMs;

    /** 错误率。 */
    private BigDecimal errorRate;

    /** CPU 使用率。 */
    private BigDecimal cpuUsage;

    /** 内存使用率。 */
    private BigDecimal memUsage;

    /** 测试结论：PASS/FAIL/PENDING。 */
    private String result;

    /** 测试人员。 */
    private String tester;

    /** 测试时间。 */
    private LocalDateTime testTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
