package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 预览转换任务（G1-N3 公共平台底座—统一文件服务 WBS T011）：CAD/Office/PDF 预览通过异步转换任务生成，
 * 登记转换引擎、目标格式与执行结果，避免在线转换阻塞上传主链路。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_file_preview_task")
public class SysFilePreviewTask extends BaseEntity {

    /** 任务编号（唯一，支持人工指定）。 */
    private String taskNo;

    /** 所属附件编号。 */
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
    private java.time.LocalDateTime startTime;

    /** 结束时间。 */
    private java.time.LocalDateTime endTime;

    /** 耗时（毫秒）。 */
    private Integer costMs;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
