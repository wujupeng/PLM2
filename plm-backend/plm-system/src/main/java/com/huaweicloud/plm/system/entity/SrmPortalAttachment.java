package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * SRM 供应商门户—门户附件：登记附件编号、所属业务类型与业务单号、供应商信息、文件名称与存储路径、
 * 文件类型与大小、上传人与上传日期、附件状态及组织信息，支撑门户侧附件的统一归档与追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_portal_attachment")
public class SrmPortalAttachment extends BaseEntity {

    /** 附件编号（为空时自动生成）。 */
    private String attachmentNo;

    /** 业务类型：ORDER/DELIVERY/QUALITY/MESSAGE，默认 MESSAGE。 */
    private String bizType;

    /** 关联业务单号。 */
    private String bizNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 文件名。 */
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

    /** 附件状态，默认 PENDING。 */
    private String attachmentStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
