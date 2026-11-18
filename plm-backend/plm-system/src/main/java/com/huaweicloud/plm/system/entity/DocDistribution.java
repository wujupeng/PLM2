package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 图文档受控分发记录（DEV-038）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("doc_distribution")
public class DocDistribution extends BaseEntity {

    /** 所属图文档 ID。 */
    private Long documentId;

    /** 图文档编号。 */
    private String docNo;

    /** 版本号。 */
    private String versionNo;

    /** 接收方类型：user/role/org 等。 */
    private String recipientType;

    /** 接收方编码。 */
    private String recipientCode;

    /** 接收方名称。 */
    private String recipientName;

    /** 分发时间。 */
    private LocalDateTime distributedAt;

    /** 状态：active/recalled。 */
    private String status;

    private String remark;
}
