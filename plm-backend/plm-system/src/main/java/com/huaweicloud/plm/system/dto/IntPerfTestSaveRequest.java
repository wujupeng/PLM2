package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/** 性能测试保存请求（N9，DEV-101）。 */
@Data
public class IntPerfTestSaveRequest {

    /** 测试编号，为空时自动生成。 */
    private String testNo;

    /** 场景：BOM_EXPLODE/BATCH_IMPORT/SCAN_CONCURRENT/EDI_PEAK/TRACE_QUERY。 */
    @NotBlank(message = "测试场景不能为空")
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

    /** 报告路径。 */
    private String reportPath;

    private String remark;
}
