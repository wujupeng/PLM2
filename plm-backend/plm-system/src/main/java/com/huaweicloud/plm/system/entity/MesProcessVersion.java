package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * MES 工艺版本。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_process_version")
public class MesProcessVersion extends BaseEntity {

    /** 工艺版本号。 */
    private String processVersionNo;

    /** 工艺编码。 */
    private String processCode;

    /** 工艺名称。 */
    private String processName;

    /** 版本号。 */
    private String versionNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 工艺路线编码。 */
    private String routeCode;

    /** 工艺路线名称。 */
    private String routeName;

    /** 生效日期。 */
    private LocalDateTime effectiveDate;

    /** 失效日期。 */
    private LocalDateTime expireDate;

    /** 版本状态，默认 DRAFT。 */
    private String versionStatus;

    /** 审批人。 */
    private String approver;

    /** 审批时间。 */
    private LocalDateTime approveTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
