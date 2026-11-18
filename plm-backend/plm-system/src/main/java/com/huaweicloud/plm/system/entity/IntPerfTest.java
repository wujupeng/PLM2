package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 性能测试（N9，DEV-101）：BOM 展开、批量导入、扫码并发、EDI 峰值与追溯查询的目标与实测指标。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("int_perf_test")
public class IntPerfTest extends BaseEntity {

    /** 测试编号（唯一）。 */
    private String testNo;

    /** 场景：BOM_EXPLODE/BATCH_IMPORT/SCAN_CONCURRENT/EDI_PEAK/TRACE_QUERY。 */
    private String scenario;

    /** 目标吞吐（RPS）。 */
    private BigDecimal targetRps;

    /** 目标 P95 响应（毫秒）。 */
    private BigDecimal targetP95Ms;

    /** 实测吞吐（RPS）。 */
    private BigDecimal actualRps;

    /** 实测 P95 响应（毫秒）。 */
    private BigDecimal actualP95Ms;

    /** 并发数。 */
    private Integer concurrency;

    /** 持续时间（秒）。 */
    private Integer durationSec;

    /** 结果：PASS/FAIL。 */
    private String result;

    /** 测试时间。 */
    private LocalDateTime testAt;

    /** 报告路径。 */
    private String reportPath;

    private String remark;
}
