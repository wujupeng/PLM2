package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 病毒扫描记录保存请求（G1-N3 公共平台底座—统一文件服务 WBS T011）。
 */
@Data
public class SysFileScanRecordSaveRequest {

    /** 扫描编号（为空时自动生成）。 */
    private String scanNo;

    /** 所属附件编号。 */
    @NotBlank(message = "附件编号不能为空")
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
    private LocalDateTime scanTime;

    /** 耗时（毫秒）。 */
    private Integer costMs;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
