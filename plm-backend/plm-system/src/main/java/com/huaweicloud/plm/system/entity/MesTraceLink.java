package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 追溯关联（人员/设备/工艺/物料/参数）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_trace_link")
public class MesTraceLink extends BaseEntity {

    /** 追溯关联编号。 */
    private String linkNo;

    /** 对象类型，默认 SERIAL。 */
    private String objectType;

    /** 对象编码。 */
    private String objectCode;

    /** 关联类型，默认 PERSON。 */
    private String linkType;

    /** 关联编码。 */
    private String linkCode;

    /** 关联名称。 */
    private String linkName;

    /** 关联取值。 */
    private String linkValue;

    /** 关联时间。 */
    private LocalDateTime linkTime;

    /** 操作人。 */
    private String operator;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
