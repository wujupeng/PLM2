package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 追溯码（Data Matrix）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_trace_code")
public class MesTraceCode extends BaseEntity {

    /** 追溯码编号。 */
    private String codeNo;

    /** 码制，默认 DATAMATRIX。 */
    private String codeType;

    /** 追溯码状态，默认 INACTIVE。 */
    private String codeStatus;

    /** 追溯码内容。 */
    private String codeContent;

    /** 对象类型，默认 SERIAL。 */
    private String objectType;

    /** 对象编码。 */
    private String objectCode;

    /** 打印时间。 */
    private LocalDateTime printTime;

    /** 打印次数。 */
    private Integer printCount;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
