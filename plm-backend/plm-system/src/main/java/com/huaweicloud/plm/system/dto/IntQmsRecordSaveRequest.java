package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/** QMS 质量记录保存请求（N9，DEV-097）。 */
@Data
public class IntQmsRecordSaveRequest {

    /** 质量记录编号，为空时自动生成。 */
    private String recordNo;

    /** 记录类型：INCOMING/IN_PROCESS/FINAL/COMPLAINT/SUPPLIER。 */
    @NotBlank(message = "记录类型不能为空")
    private String recordType;

    /** 来源单号（如检验单号）。 */
    private String sourceNo;

    /** 产品编码。 */
    private String productCode;

    /** 物料编码。 */
    private String materialCode;

    /** 批次号。 */
    private String batchNo;

    /** 产品版本。 */
    private String productVersion;

    /** 检验项目。 */
    private String inspectionItem;

    /** 检验结果：PASS/FAIL/CONCESSION。 */
    private String result;

    /** 缺陷代码。 */
    private String defectCode;

    /** 缺陷等级：CRITICAL/MAJOR/MINOR。 */
    private String defectLevel;

    /** 处置方式。 */
    private String disposition;

    /** 发生时间，为空时取当前时间。 */
    private LocalDateTime occurredAt;

    /** 来源系统。 */
    private String sourceSystem;

    /** 关联产品编码。 */
    private String relatedProductCode;

    /** 附件地址。 */
    private String attachmentUrl;

    /** 接口状态：RECEIVED/PROCESSED/FAILED，为空时默认 RECEIVED。 */
    private String interfaceStatus;

    private String remark;
}
