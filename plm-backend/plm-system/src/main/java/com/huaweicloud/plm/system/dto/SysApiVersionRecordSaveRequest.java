package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 接口版本记录保存请求（G1-N1 集成平台 T009）。
 */
@Data
public class SysApiVersionRecordSaveRequest {

    /** 版本记录编号（为空时自动生成）。 */
    private String recordNo;

    /** 接口编码。 */
    @NotBlank(message = "接口编码不能为空")
    private String apiCode;

    /** 接口名称。 */
    private String apiName;

    /** 版本号。 */
    @NotBlank(message = "版本号不能为空")
    private String versionNo;

    /** 变更类型：MAJOR/MINOR/PATCH。 */
    private String changeType;

    /** 兼容性：COMPATIBLE/BREAKING。 */
    private String compatibility;

    /** 变更日志。 */
    private String changeLog;

    /** 发布日期（yyyy-MM-dd HH:mm:ss）。 */
    private String releaseDate;

    /** 版本状态：DRAFT/PUBLISHED/RELEASED。 */
    private String versionStatus;

    /** 操作人。 */
    private String operatorName;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
