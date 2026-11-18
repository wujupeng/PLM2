package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

/**
 * 门户附件保存请求（对应门户附件）。
 */
@Data
public class SrmPortalAttachmentSaveRequest {

    /** 附件编号（为空时自动生成）。 */
    private String attachmentNo;

    /** 业务类型：ORDER/DELIVERY/QUALITY/MESSAGE，为空默认 MESSAGE。 */
    private String bizType;

    /** 关联业务单号。 */
    private String bizNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 文件名。 */
    @NotBlank(message = "文件名不能为空")
    private String fileName;

    /** 文件路径。 */
    private String filePath;

    /** 文件类型。 */
    private String fileType;

    /** 文件大小（字节）。 */
    private Long fileSize;

    /** 上传人。 */
    private String uploader;

    /** 上传日期。 */
    private LocalDate uploadDate;

    /** 附件状态，为空默认 PENDING。 */
    private String attachmentStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
