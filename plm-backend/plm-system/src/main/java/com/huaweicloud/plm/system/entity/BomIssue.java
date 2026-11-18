package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * BOM 异常校验结果（DEV-029）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("bom_issue")
public class BomIssue extends BaseEntity {

    /** 所属 BOM 头 ID。 */
    private Long headerId;

    /** 异常类型：duplicate/orphan/cycle/missingQty。 */
    private String issueType;

    /** 严重级别：error/warning/info。 */
    private String severity;

    /** 行号。 */
    private Integer lineNo;

    /** 相关物料编码。 */
    private String materialCode;

    /** 异常描述。 */
    private String message;

    /** 处理状态：open/fixed/ignored。 */
    private String status;
}
