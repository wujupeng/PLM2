package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 接口版本记录（G1-N1 集成平台 T009）：接口契约的版本变更留痕与兼容性标注。
 * 每次版本变更记录变更类型、兼容性与变更日志，避免口头约定导致联调返工。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_api_version_record")
public class SysApiVersionRecord extends BaseEntity {

    /** 版本记录编号。 */
    private String recordNo;

    /** 接口编码。 */
    private String apiCode;

    /** 接口名称。 */
    private String apiName;

    /** 版本号。 */
    private String versionNo;

    /** 变更类型：MAJOR/MINOR/PATCH。 */
    private String changeType;

    /** 兼容性：COMPATIBLE/BREAKING。 */
    private String compatibility;

    /** 变更日志。 */
    private String changeLog;

    /** 发布日期。 */
    private LocalDateTime releaseDate;

    /** 版本状态：DRAFT/PUBLISHED/RELEASED。 */
    private String versionStatus;

    /** 操作人。 */
    private String operatorName;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
