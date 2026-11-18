package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * PDA 设备（G1-N6 公共平台底座—通用能力 WBS T106 移动端与PDA）：
 * 登记设备编号、类型（PDA/PHONE/SCANNER/TABLET）、型号、绑定用户与运行状态
 * （ACTIVE 在线/OFFLINE 离线/DISABLED 停用）及最近活跃时间，为移动端鉴权、
 * 离线同步与设备级审计提供基础。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_mobile_device")
public class SysMobileDevice extends BaseEntity {

    /** 设备编号（唯一，支持人工指定）。 */
    private String deviceNo;

    /** 设备名称。 */
    private String deviceName;

    /** 设备类型：PDA/PHONE/SCANNER/TABLET，默认 PDA。 */
    private String deviceType;

    /** 设备型号。 */
    private String deviceModel;

    /** 设备状态：ACTIVE/OFFLINE/DISABLED，默认 ACTIVE。 */
    private String deviceStatus;

    /** 绑定用户ID。 */
    private Long bindUserId;

    /** 绑定用户名称。 */
    private String bindUserName;

    /** 最近活跃时间。 */
    private LocalDateTime lastActiveTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
