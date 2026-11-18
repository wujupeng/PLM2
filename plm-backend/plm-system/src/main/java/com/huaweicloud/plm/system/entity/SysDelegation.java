package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_delegation")
public class SysDelegation extends BaseEntity {

    private String delegationNo;

    private Long delegatorUserId;

    private String delegatorName;

    private Long delegateUserId;

    private String delegateName;

    /** 授权范围：ALL=全部流程，PROCESS=指定流程。 */
    private String applyScope;

    /** 指定流程编码，applyScope=PROCESS 时生效。 */
    private String processCode;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    /** 授权状态：ACTIVE/REVOKED/EXPIRED。 */
    private String delegationStatus;

    private String reason;

    private String remark;
}
