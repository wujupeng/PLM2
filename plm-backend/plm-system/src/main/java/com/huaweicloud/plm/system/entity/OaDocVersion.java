package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 文档版本：每次上传或恢复生成一条版本记录，历史版本不可被无痕覆盖。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_doc_version")
public class OaDocVersion extends BaseEntity {

    private Long docId;

    private Integer versionNo;

    private String revisionNote;

    private String fileName;

    private Long fileSize;

    private String contentType;

    private String fileHash;

    private String storagePath;

    /** 扫描状态：PENDING/CLEAN/INFECTED。 */
    private String scanStatus;

    /** 未启用扫描时需要置空，故声明为始终更新。 */
    @TableField(updateStrategy = FieldStrategy.ALWAYS)
    private LocalDateTime scanAt;

    private Integer publishedFlag;

    /** 是否为当前生效版本：1 是，0 否。 */
    private Integer currentFlag;

    private Integer lockFlag;

    private Long uploadedByUserId;

    private String remark;
}
