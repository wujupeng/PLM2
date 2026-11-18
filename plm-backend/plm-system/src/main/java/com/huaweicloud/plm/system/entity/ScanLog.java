package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 扫描换标日志（N5，DEV-056/057/061）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("scan_log")
public class ScanLog extends BaseEntity {

    /** 扫描流水号（唯一）。 */
    private String scanNo;

    /** 原标签编码。 */
    private String sourceCode;

    /** 原码类型。 */
    private String sourceType;

    /** 解析结果 JSON。 */
    private String parseJson;

    /** 是否有效：1 有效 / 0 失败。 */
    private Integer validFlag;

    /** 失败原因。 */
    private String failReason;

    /** 生成的追溯码。 */
    private String targetCode;

    /** 关联映射 ID。 */
    private Long mappingId;

    /** 动作类型：NEW/REUSE/REPRINT/FAIL。 */
    private String actionType;

    /** 是否补打：1 是 / 0 否。 */
    private Integer reprintFlag;

    /** 编码规则编码。 */
    private String ruleCode;

    /** 终端编号。 */
    private String terminalNo;

    /** 操作人 ID。 */
    private Long operatorId;

    /** 操作人名称。 */
    private String operatorName;

    /** 扫描时间。 */
    private LocalDateTime scanAt;

    private String remark;
}
