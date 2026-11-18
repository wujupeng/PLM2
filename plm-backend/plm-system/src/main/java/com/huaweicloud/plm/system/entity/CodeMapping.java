package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 原码到新码的编码映射（N5，DEV-056/057/061）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("code_mapping")
public class CodeMapping extends BaseEntity {

    /** 原标签编码（唯一）。 */
    private String sourceCode;

    /** 原码类型，默认 CODE14。 */
    private String sourceCodeType;

    /** 原码规则编码。 */
    private String sourceRuleCode;

    /** 生成的追溯码。 */
    private String targetCode;

    /** 追溯码类型，默认 CODE24。 */
    private String targetCodeType;

    /** 目标编码规则 ID。 */
    private Long ruleId;

    /** 目标编码规则编码。 */
    private String ruleCode;

    /** 产品编码。 */
    private String productCode;

    /** 物料编码。 */
    private String materialCode;

    /** 批次号。 */
    private String batchNo;

    /** 数量，默认 1。 */
    private Integer qty;

    /** 工厂编码。 */
    private String plantCode;

    /** 客户编码。 */
    private String customerCode;

    /** 版本号。 */
    private String versionNo;

    /** 状态：active/void。 */
    private String status;

    /** 扫描次数，默认 1。 */
    private Integer scanCount;

    /** 首次扫描时间。 */
    private LocalDateTime firstScanAt;

    /** 最近扫描时间。 */
    private LocalDateTime lastScanAt;

    /** 操作人 ID。 */
    private Long operatorId;

    /** 操作人名称。 */
    private String operatorName;

    /** 打印任务编号。 */
    private String printTaskNo;

    private String remark;
}
