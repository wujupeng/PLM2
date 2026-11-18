package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 文件版本（G1-N3 公共平台底座—统一文件服务 WBS T011）：文件每次更新生成一条版本记录，
 * 当前生效版本标记 currentFlag，历史版本只读留痕，保证可追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_file_version")
public class SysFileVersion extends BaseEntity {

    /** 版本编号（唯一，支持人工指定）。 */
    private String versionNo;

    /** 所属附件编号。 */
    private String fileNo;

    /** 文件名称。 */
    private String fileName;

    /** 版本序号。 */
    private Integer seqNo;

    /** 存储桶。 */
    private String storageBucket;

    /** 对象存储键。 */
    private String objectKey;

    /** 文件大小（字节）。 */
    private Long fileSize;

    /** 校验和。 */
    private String checksum;

    /** 变更说明。 */
    private String changeNote;

    /** 是否当前版本：0否 1是。 */
    private Integer currentFlag;

    /** 上传人。 */
    private String uploadBy;

    /** 上传时间。 */
    private java.time.LocalDateTime uploadTime;

    /** 版本状态：ACTIVE/HISTORY。 */
    private String versionStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
