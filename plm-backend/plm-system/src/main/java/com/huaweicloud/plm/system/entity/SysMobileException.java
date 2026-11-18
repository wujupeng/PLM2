package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 移动异常队列（G1-N6 公共平台底座—通用能力 WBS T106 移动端与PDA）：
 * 承接扫码失败、标签非法、离线同步失败、权限不足、数据不一致等移动端异常，
 * 记录场景、条码、异常类型与处理状态（OPEN/HANDLING/RESOLVED/IGNORED），
 * 由现场人员在队列中处理，避免移动端异常在各系统间丢失。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_mobile_exception")
public class SysMobileException extends BaseEntity {

    /** 异常编号（唯一，支持人工指定）。 */
    private String exceptionNo;

    /** 场景编码。 */
    private String sceneCode;

    /** 条码。 */
    private String barcode;

    /** 异常类型：SCAN_FAIL/LABEL_INVALID/OFFLINE_SYNC/PERMISSION/DATA_MISMATCH，默认 SCAN_FAIL。 */
    private String errorType;

    /** 异常信息。 */
    private String errorMessage;

    /** 处理状态：OPEN/HANDLING/RESOLVED/IGNORED，默认 OPEN。 */
    private String exceptionStatus;

    /** 处理人。 */
    private String handlerName;

    /** 处理时间。 */
    private LocalDateTime handledTime;

    /** 处理说明。 */
    private String handleNote;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
