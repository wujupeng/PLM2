package com.huaweicloud.plm.system.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** 单条来源单据；payload 使用现有 ERP 保存请求字段，订单/到货类另带 lines 数组。 */
@Data
public class MigOpenBusinessImportRecord {

    @NotBlank(message = "来源单号不能为空")
    @Size(max = 128, message = "来源单号不能超过128个字符")
    private String sourceNo;

    @NotBlank(message = "迁移对象类型不能为空")
    @Size(max = 32, message = "迁移对象类型不能超过32个字符")
    private String objectType;

    @NotNull(message = "来源业务数据不能为空")
    private JsonNode payload;
}
