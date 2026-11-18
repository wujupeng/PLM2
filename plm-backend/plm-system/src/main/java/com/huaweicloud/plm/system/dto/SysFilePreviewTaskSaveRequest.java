package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 预览转换任务保存请求（G1-N3 公共平台底座—统一文件服务 WBS T011）。
 */
@Data
public class SysFilePreviewTaskSaveRequest {

    /** 任务编号（为空时自动生成）。 */
    private String taskNo;

    /** 所属附件编号。 */
    @NotBlank(message = "附件编号不能为空")
    private String fileNo;

    /** 文件名称。 */
    private String fileName;

    /** 源文件扩展名。 */
    private String sourceExt;

    /** 目标格式：PDF/IMAGE/HTML。 */
    private String targetFormat;

    /** 转换模式：OFFICE/CAD/PDF/IMAGE。 */
    private String convertMode;

    /** 转换引擎。 */
    private String convertEngine;

    /** 任务状态：PENDING/PROCESSING/SUCCESS/FAILED。 */
    private String taskStatus;

    /** 预览地址。 */
    private String previewUrl;

    /** 错误信息。 */
    private String errorMessage;

    /** 重试次数。 */
    private Integer retryCount;

    /** 开始时间。 */
    private LocalDateTime startTime;

    /** 结束时间。 */
    private LocalDateTime endTime;

    /** 耗时（毫秒）。 */
    private Integer costMs;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
