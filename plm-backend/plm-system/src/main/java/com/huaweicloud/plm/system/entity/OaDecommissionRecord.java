package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 完成授权和资源回收（OA-DEV-120）：切换完成后对原有 OA 的账号授权撤销与资源回收记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_decommission_record")
public class OaDecommissionRecord extends BaseEntity {

    /** 回收编号。 */
    private String decommissionNo;

    /** 回收名称。 */
    private String decommissionName;

    /** 资源类型：ACCESS/LICENSE。 */
    private String resourceType;

    /** 资源说明。 */
    private String resourceDesc;

    /** 授权撤销范围。 */
    private String revokeScope;

    /** 是否已批准：0 否 / 1 是。 */
    private Integer approved;

    /** 批准人。 */
    private String approver;

    /** 回收状态：PENDING/EXECUTED。 */
    private String decommissionStatus;

    /** 执行时间。 */
    private LocalDateTime executeTime;

    /** 是否保留备份：0 否 / 1 是。 */
    private Integer backupKept;

    /** 风险说明。 */
    private String riskNote;

    /** 操作人。 */
    private String operatorName;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
