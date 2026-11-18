package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.List;

/**
 * 扫描换标结果（N5）。
 */
@Data
public class RelabelScanResponse {

    /** 扫描日志 ID。 */
    private Long scanLogId;

    /** 扫描流水号。 */
    private String scanNo;

    /** 动作类型：NEW/REUSE/REPRINT/FAIL。 */
    private String actionType;

    /** 是否有效。 */
    private Boolean validFlag;

    /** 失败原因。 */
    private String failReason;

    /** 原标签编码。 */
    private String sourceCode;

    /** 原码类型。 */
    private String sourceType;

    /** 生成的追溯码。 */
    private String targetCode;

    /** 映射 ID。 */
    private Long mappingId;

    /** 打印任务编号。 */
    private String printTaskNo;

    /** 新码分段明细。 */
    private List<CodeSegmentValueResponse> segments;

    /** 告警提示集合。 */
    private List<String> warnings;

    /** 流水号数值。 */
    private Integer sequenceValue;

    /** 是否触发流水号预警。 */
    private Boolean sequenceWarn;

    /** 流水号预警提示。 */
    private String sequenceMessage;

    /** 是否命中已有映射/防重。 */
    private Boolean existing;
}
