package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 标签打印任务（N5）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("label_print_task")
public class LabelPrintTask extends BaseEntity {

    /** 任务编号，唯一。 */
    private String taskNo;

    /** 标签模板 ID。 */
    private Long templateId;

    /** 标签模板编码。 */
    private String templateCode;

    /** 标签类型，默认 CODE24。 */
    private String labelType;

    /** 来源编码。 */
    private String sourceCode;

    /** 目标编码。 */
    private String targetCode;

    /** 产品编码。 */
    private String productCode;

    /** 物料编码。 */
    private String materialCode;

    /** 打印数量，默认 1。 */
    private Integer qty;

    /** 已打印数量，默认 1。 */
    private Integer printedQty;

    /** 是否补打：0-否，1-是。 */
    private Integer reprintFlag;

    /** 补打原因。 */
    private String reprintReason;

    /** 原任务编号。 */
    private String originTaskNo;

    /** 打印机名称。 */
    private String printerName;

    /** 打印状态，默认 success。 */
    private String printStatus;

    /** 打印时间。 */
    private LocalDateTime printAt;

    /** 渲染内容 JSON。 */
    private String contentText;

    /** 关联扫码日志 ID。 */
    private Long scanLogId;

    /** 操作人 ID。 */
    private Long operatorId;

    /** 操作人姓名。 */
    private String operatorName;

    private String remark;
}
