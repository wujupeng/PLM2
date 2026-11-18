package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 病毒扫描记录（G1-N3 公共平台底座—统一文件服务 WBS T011）：上传后登记扫描记录，
 * 扫描结果回写附件状态，未通过扫描的文件置隔离，禁止下载与外发。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_file_scan_record")
public class SysFileScanRecord extends BaseEntity {

    /** 扫描编号（唯一，支持人工指定）。 */
    private String scanNo;

    /** 所属附件编号。 */
    private String fileNo;

    /** 文件名称。 */
    private String fileName;

    /** 扫描引擎。 */
    private String scanEngine;

    /** 引擎版本。 */
    private String engineVersion;

    /** 病毒名称。 */
    private String virusName;

    /** 扫描结果：CLEAN/INFECTED/ERROR。 */
    private String scanResult;

    /** 采取动作：PASS/QUARANTINE/DELETE。 */
    private String actionTaken;

    /** 扫描时间。 */
    private java.time.LocalDateTime scanTime;

    /** 耗时（毫秒）。 */
    private Integer costMs;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
