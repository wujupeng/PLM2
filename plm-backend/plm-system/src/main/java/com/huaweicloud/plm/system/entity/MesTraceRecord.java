package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 追溯记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_trace_record")
public class MesTraceRecord extends BaseEntity {

    /** 追溯记录编号。 */
    private String recordNo;

    /** 对象类型，默认 SERIAL。 */
    private String objectType;

    /** 对象编码。 */
    private String objectCode;

    /** 追溯记录状态，默认 DRAFT。 */
    private String recordStatus;

    /** 追溯路径。 */
    private String tracePath;

    /** 追溯节点数。 */
    private Integer nodeCount;

    /** 追溯时间。 */
    private LocalDateTime recordTime;

    /** 追溯人。 */
    private String recorder;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
