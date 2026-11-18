package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ConfigSaveRequest {

    @NotBlank(message = "配置分类不能为空")
    private String category;

    @NotBlank(message = "配置键不能为空")
    private String configKey;

    @NotBlank(message = "配置名称不能为空")
    private String configName;

    private String configValue;

    /** 1=业务方待确认项。 */
    private Integer pendingConfirm;

    private Integer editable;

    private String remark;
}
