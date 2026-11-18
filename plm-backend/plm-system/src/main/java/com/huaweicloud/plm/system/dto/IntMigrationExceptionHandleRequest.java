package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** 迁移异常处理请求（N9，DEV-098）。 */
@Data
public class IntMigrationExceptionHandleRequest {

    /** 处理状态：OPEN/RESOLVED/IGNORED。 */
    @NotBlank(message = "处理状态不能为空")
    private String handleStatus;

    /** 处理备注。 */
    private String remark;
}
