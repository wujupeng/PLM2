package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 工程变更对象明细（DEV-040 / DEV-041）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("eco_change_item")
public class EcoChangeItem extends BaseEntity {

    /** 所属变更单 ID。 */
    private Long ecoId;

    /** 变更对象类型：product/material/document/bom/process。 */
    private String objectType;

    /** 变更对象编码。 */
    private String objectCode;

    /** 变更对象名称。 */
    private String objectName;

    /** 变更动作：add/modify/delete/switch。 */
    private String changeAction;

    /** 变更前版本。 */
    private String beforeVersion;

    /** 变更后版本。 */
    private String afterVersion;

    /** 版本切换状态：pending/switched/failed。 */
    private String switchStatus;

    /** 版本切换时间。 */
    private LocalDateTime switchedAt;

    private String remark;
}
