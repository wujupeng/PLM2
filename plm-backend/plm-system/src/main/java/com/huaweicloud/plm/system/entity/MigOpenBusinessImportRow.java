package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/** 未结业务迁移原始数据暂存行及审核/正式单据关联。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mig_open_business_import_row")
public class MigOpenBusinessImportRow extends BaseEntity {

    private Long batchId;
    private String batchNo;
    private String sourceNo;
    private String objectType;
    private String sourceFile;
    private String sourcePayload;
    private String rowStatus;
    private String validationMessage;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private String reviewComment;
    private Long targetId;
    private LocalDateTime promotedAt;
}
