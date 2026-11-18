package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.List;

/**
 * 物料环保合规校验结果。
 */
@Data
public class SpecComplianceCheckResult {

    /** 是否通过校验。 */
    private boolean passed;

    /** 缺失的强制合规要求类型。 */
    private List<String> missingTypes;

    /** 已过期的强制合规要求类型。 */
    private List<String> expiredTypes;

    /** 校验说明。 */
    private String message;
}
