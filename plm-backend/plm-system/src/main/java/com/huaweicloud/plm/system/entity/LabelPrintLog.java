package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 标签打印日志（N5）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("label_print_log")
public class LabelPrintLog extends BaseEntity {

    /** 打印任务 ID。 */
    private Long taskId;

    /** 任务编号。 */
    private String taskNo;

    /** 操作类型：PRINT/REPRINT/VOID。 */
    private String actionType;

    /** 目标编码。 */
    private String targetCode;

    /** 标签模板编码。 */
    private String templateCode;

    /** 打印机名称。 */
    private String printerName;

    /** 结果，默认 success。 */
    private String result;

    /** 明细信息。 */
    private String message;

    /** 打印时间。 */
    private LocalDateTime printAt;

    /** 操作人 ID。 */
    private Long operatorId;

    /** 操作人姓名。 */
    private String operatorName;

    private String remark;
}
