package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 主数据差异（N9，DEV-095）：同步不一致的字段级差异清单与处理结果。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("int_master_data_diff")
public class IntMasterDataDiff extends BaseEntity {

    /** 关联同步编号。 */
    private String syncNo;

    /** 主数据类型。 */
    private String masterType;

    /** 主数据编码。 */
    private String masterCode;

    /** 差异字段名。 */
    private String fieldName;

    /** 来源端取值。 */
    private String sourceValue;

    /** 目标端取值。 */
    private String targetValue;

    /** 差异类型：VALUE_DIFF/MISSING_IN_TARGET/MISSING_IN_SOURCE。 */
    private String diffType;

    /** 处理状态：OPEN/RESOLVED/IGNORED。 */
    private String handleStatus;

    /** 处理人。 */
    private String resolvedBy;

    /** 处理时间。 */
    private LocalDateTime resolvedAt;

    /** 处理说明。 */
    private String resolution;

    private String remark;
}
