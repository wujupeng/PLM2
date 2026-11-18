package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 培训交付材料保存请求（OA-DEV-112）。
 */
@Data
public class OaTrainingMaterialSaveRequest {

    /** 材料编号。 */
    private String materialNo;

    /** 材料名称。 */
    @NotBlank(message = "材料名称不能为空")
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

    /** 发布时间（yyyy-MM-dd HH:mm:ss）。 */
    private String publishTime;

    /** 应到人数。 */
    private Integer audienceCount;

    /** 已签到人数。 */
    private Integer signedCount;

    /** 状态：0停用/1启用。 */
    private Integer status;

    /** 备注。 */
    private String remark;
}
