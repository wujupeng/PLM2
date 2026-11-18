package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 导出任务（N9，DEV-099）：数据导入导出与退出能力，不依赖供应商私有工具。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("int_export_task")
public class IntExportTask extends BaseEntity {

    /** 任务编号（唯一）。 */
    private String taskNo;

    /** 导出范围：MASTER_DATA/BOM/TRACE/ATTACHMENT/ALL。 */
    private String scope;

    /** 导出格式：CSV/EXCEL/JSON。 */
    private String exportFormat;

    /** 是否包含附件：1 包含 / 0 不包含。 */
    private Integer includeAttachment;

    /** 导出记录数。 */
    private Long recordCount;

    /** 文件路径。 */
    private String filePath;

    /** 文件大小（字节）。 */
    private Long fileSize;

    /** 任务状态：PENDING/RUNNING/SUCCESS/FAILED/CANCELLED。 */
    private String taskStatus;

    /** 申请人。 */
    private String requestedBy;

    /** 开始时间。 */
    private LocalDateTime startedAt;

    /** 结束时间。 */
    private LocalDateTime finishedAt;

    /** 错误信息。 */
    private String errorMessage;

    private String remark;
}
