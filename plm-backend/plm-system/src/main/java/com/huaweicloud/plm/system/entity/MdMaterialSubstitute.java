package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 物料替代关系（DEV-021）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("md_material_substitute")
public class MdMaterialSubstitute extends BaseEntity {

    /** 被替代物料 ID。 */
    private Long materialId;

    /** 被替代物料编码。 */
    private String materialCode;

    /** 替代物料 ID。 */
    private Long substituteMaterialId;

    /** 替代物料编码。 */
    private String substituteMaterialCode;

    /** 替代优先级，数值越小优先级越高。 */
    private Integer priority;

    /** 适用条件。 */
    private String applicableCondition;

    /** 生效日期。 */
    private LocalDate validFrom;

    /** 失效日期。 */
    private LocalDate validTo;

    /** 状态：1=启用，0=停用。 */
    private Integer status;

    private String remark;
}
