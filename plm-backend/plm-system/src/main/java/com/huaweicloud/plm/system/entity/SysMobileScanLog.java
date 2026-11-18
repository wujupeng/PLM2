package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 扫码操作日志（G1-N6 公共平台底座—通用能力 WBS T106 移动端与PDA）：
 * 逐次记录扫码动作的场景、条码、业务键、关联单据、操作人、设备、扫码时间与扫码结果
 * （SUCCESS/FAIL），用于移动作业溯源与异常定位。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_mobile_scan_log")
public class SysMobileScanLog extends BaseEntity {

    /** 日志编号（唯一，支持人工指定）。 */
    private String logNo;

    /** 场景编码。 */
    private String sceneCode;

    /** 扫码类型。 */
    private String scanType;

    /** 条码。 */
    private String barcode;

    /** 业务键。 */
    private String bizKey;

    /** 关联单据号。 */
    private String docNo;

    /** 操作人ID。 */
    private Long operatorId;

    /** 操作人名称。 */
    private String operatorName;

    /** 设备编号。 */
    private String deviceNo;

    /** 扫码时间。 */
    private LocalDateTime scanTime;

    /** 扫码结果：SUCCESS/FAIL，默认 SUCCESS。 */
    private String scanResult;

    /** 结果信息。 */
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
