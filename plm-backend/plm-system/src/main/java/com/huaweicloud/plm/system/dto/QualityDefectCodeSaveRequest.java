package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 缺陷代码保存请求。
 */
@Data
public class QualityDefectCodeSaveRequest {

    @NotBlank(message = "缺陷代码不能为空")
    private String defectCode;

    @NotBlank(message = "缺陷名称不能为空")
    private String defectName;

    /** 缺陷分类。 */
    private String defectCategory;

    /** 工序编码。 */
    private String operationCode;

    /** 工位。 */
    private String station;

    /** 责任部门。 */
    private String responsibleDept;

    /** 默认原因。 */
    private String defaultCause;

    /** 默认措施。 */
    private String defaultAction;

    /** 严重度：minor/major/critical，为空时默认 minor。 */
    private String severity;

    /** 状态：0-停用 1-启用，为空时默认 1。 */
    private Integer status;

    private String remark;
}
