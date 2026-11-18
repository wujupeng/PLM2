package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 统一附件（G1-N3 公共平台底座—统一文件服务 WBS T011）：六大系统附件统一登记，
 * 按业务模块/业务单据关联，元数据与实体文件分离，统一权限与生命周期管理。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_file_attachment")
public class SysFileAttachment extends BaseEntity {

    /** 附件编号（唯一，支持人工指定）。 */
    private String fileNo;

    /** 文件名称。 */
    private String fileName;

    /** 原始文件名。 */
    private String originalName;

    /** 文件扩展名。 */
    private String fileExt;

    /** 业务模块：PLM/ERP/SRM/MES/WMS/OA。 */
    private String bizModule;

    /** 业务单据类型。 */
    private String bizType;

    /** 业务单据ID。 */
    private String bizId;

    /** 业务单据编号。 */
    private String bizNo;

    /** 存储类型：OBJECT/LOCAL。 */
    private String storageType;

    /** 存储桶。 */
    private String storageBucket;

    /** 对象存储键。 */
    private String objectKey;

    /** 文件大小（字节）。 */
    private Long fileSize;

    /** 内容类型（MIME）。 */
    private String contentType;

    /** 校验和。 */
    private String checksum;

    /** 密级：PUBLIC/INTERNAL/CONFIDENTIAL/SECRET。 */
    private String securityLevel;

    /** 扫描状态：PENDING/CLEAN/INFECTED/ERROR。 */
    private String scanStatus;

    /** 是否支持预览：0否 1是。 */
    private Integer previewSupported;

    /** 最新版本编号。 */
    private String latestVersionNo;

    /** 上传人。 */
    private String uploadBy;

    /** 上传时间。 */
    private java.time.LocalDateTime uploadTime;

    /** 保留年限。 */
    private Integer retentionYears;

    /** 归档状态：NONE/PENDING/ARCHIVED/RESTORING/RESTORED/EXPIRED。 */
    private String archiveStatus;

    /** 文件状态：NORMAL/QUARANTINED/ARCHIVED/DELETED。 */
    private String fileStatus;

    /** 文件说明。 */
    private String description;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
