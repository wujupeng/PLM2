package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 每日流水号（N5），按维度维护当前值与上限，支持预警、不回绕。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("code_sequence")
public class CodeSequence extends BaseEntity {

    /** 流水号键（唯一），形如 codeType|scopeKey|日期后缀。 */
    private String seqKey;

    /** 维度：DAY / MONTH / 其它（GLOBAL）。 */
    private String seqDimension;

    /** 流水号所属日期。 */
    private LocalDate seqDate;

    /** 初始值，默认 1。 */
    private Integer initValue;

    /** 当前值，默认 0。 */
    private Integer currentValue;

    /** 最大值（上限），默认 9999，不回绕。 */
    private Integer maxValue;

    /** 预警阈值，大于 0 时生效。 */
    private Integer warnThreshold;

    /** 预警标记，1=已触发预警。 */
    private Integer warnFlag;

    /** 最近一次生成时间。 */
    private LocalDateTime lastGeneratedAt;

    private String remark;
}
