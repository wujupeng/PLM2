package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 培训交付材料（OA-DEV-112）：培训材料名称、类型、目标角色、发布版本与签到情况。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_training_material")
public class OaTrainingMaterial extends BaseEntity {

    /** 材料编号。 */
    private String materialNo;

    /** 材料名称。 */
    private String materialName;

    /** 材料类型：MANUAL/VIDEO/FAQ/ROLE_TRAINING。 */
    private String materialType;

    /** 目标角色。 */
    private String targetRole;

    /** 材料格式。 */
    private String format;

    /** 材料存放位置。 */
    private String location;

    /** 材料版本。 */
    private String materialVersion;

    /** 发布时间。 */
    private LocalDateTime publishTime;

    /** 应到人数。 */
    private Integer audienceCount;

    /** 已签到人数。 */
    private Integer signedCount;

    /** 状态：0停用/1启用。 */
    private Integer status;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
