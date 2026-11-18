package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文件版本保存请求（G1-N3 公共平台底座—统一文件服务 WBS T011）。
 */
@Data
public class SysFileVersionSaveRequest {

    /** 版本编号（为空时自动生成）。 */
    private String versionNo;

    /** 所属附件编号。 */
    @NotBlank(message = "附件编号不能为空")
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
    private LocalDateTime uploadTime;

    /** 版本状态：ACTIVE/HISTORY。 */
    private String versionStatus;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
