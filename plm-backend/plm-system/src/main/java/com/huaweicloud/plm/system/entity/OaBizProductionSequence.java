package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 生产顺序表（OA-DEV-065，排产权威归属 MES 待确认）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_biz_production_sequence")
public class OaBizProductionSequence extends BaseEntity {

    /** 生产顺序表编号。 */
    private String sequenceNo;

    private String sequenceName;

    /** 版本号（业务字段，非乐观锁）。 */
    private Integer sequenceVersion;

    private String planPeriod;

    private String workshop;

    /** 数据来源：OA/MES 等。 */
    private String planSource;

    /** 顺序表状态：DRAFT/PUBLISHED 等。 */
    private String seqStatus;

    private Integer itemCount;

    private LocalDateTime publishTime;

    private Long publisherUserId;

    private String publisherName;

    private Long ownerUserId;

    private String ownerName;

    private Long orgId;

    private String orgName;

    private String remark;
}
