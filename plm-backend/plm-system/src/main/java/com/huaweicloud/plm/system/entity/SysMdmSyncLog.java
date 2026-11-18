package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 主数据平台—同步日志（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 登记主数据在各系统间同步的执行日志，支持异常定位。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_mdm_sync_log")
public class SysMdmSyncLog extends BaseEntity {

    /** 同步日志编号（唯一）。 */
    private String logNo;

    /** 主数据域编码。 */
    private String domainCode;

    /** 源系统。 */
    private String sourceSystem;

    /** 目标系统。 */
    private String targetSystem;

    /** 主数据编码。 */
    private String masterCode;

    /** 同步状态，默认 SUCCESS。 */
    private String syncStatus;

    /** 同步时间。 */
    private LocalDateTime syncTime;

    /** 同步信息。 */
    private String message;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
