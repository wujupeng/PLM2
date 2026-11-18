package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 性能与容量测试保存请求（OA-DEV-108）。
 */
@Data
public class OaPerfTestSaveRequest {

    /** 测试编号。 */
    private String testNo;

    /** 压测场景名称。 */
    @NotBlank(message = "压测场景名称不能为空")
    private String sceneName;

    /** 负载模型。 */
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

    /** 测试结论。 */
    private String result;

    /** 测试人员。 */
    private String tester;

    /** 测试时间（yyyy-MM-dd HH:mm:ss）。 */
    private String testTime;

    /** 备注。 */
    private String remark;
}
