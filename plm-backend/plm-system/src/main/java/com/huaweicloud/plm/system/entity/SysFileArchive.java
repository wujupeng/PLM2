package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 文件归档（G1-N3 公共平台底座—统一文件服务 WBS T011）：按文件登记归档策略（热/冷/永久）、
 * 存储级别与保留年限，到期可下沉归档或清理，并支持归档恢复。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_file_archive")
public class SysFileArchive extends BaseEntity {

    /** 归档编号（唯一，支持人工指定）。 */
    private String archiveNo;

    /** 所属附件编号。 */
    private String fileNo;

    /** 文件名称。 */
    private String fileName;

    /** 归档类型：HOT/COLD/PERMANENT。 */
    private String archiveType;

    /** 存储级别：STANDARD/IA/ARCHIVE。 */
    private String storageClass;

    /** 保留年限。 */
    private Integer retentionYears;

    /** 归档存储路径。 */
    private String storagePath;

    /** 归档时间。 */
    private java.time.LocalDateTime archiveTime;

    /** 过期时间。 */
    private java.time.LocalDateTime expireTime;

    /** 归档状态：PENDING/ARCHIVED/RESTORING/RESTORED/EXPIRED。 */
    private String archiveStatus;

    /** 恢复状态：NONE/REQUESTED/DONE。 */
    private String restoreStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
