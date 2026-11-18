package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

/**
 * 物料替代关系保存请求。
 */
@Data
public class MaterialSubstituteRequest {

    @NotBlank(message = "替代物料编码不能为空")
    private String substituteMaterialCode;

    /** 替代优先级，数值越小优先级越高。 */
    private Integer priority;

    private String applicableCondition;

    private LocalDate validFrom;

    private LocalDate validTo;

    private String remark;
}
