package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 幂等记录（G1-N1 集成平台，WBS T009）：以幂等键防止重复投递导致下游重复入账，
 * 记录业务标识、请求摘要、处理结果与过期时间，是六系统数据互通的前提。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_idempotent_record")
public class SysIdempotentRecord extends BaseEntity {

    /** 幂等键（唯一）。 */
    private String idempotentKey;

    /** 业务类型。 */
    private String bizType;

    /** 业务ID。 */
    private String bizId;

    /** 请求摘要哈希。 */
    private String requestHash;

    /** 处理结果码。 */
    private Integer resultCode;

    /** 过期时间。 */
    private LocalDateTime expireAt;

    /** 记录状态：PROCESSING/SUCCESS/DUPLICATE/FAILED。 */
    private String recordStatus;

    /** 操作人。 */
    private String operatorName;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
