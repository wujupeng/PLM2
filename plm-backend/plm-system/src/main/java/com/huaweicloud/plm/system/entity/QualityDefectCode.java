package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 缺陷代码库（DEV-049）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("quality_defect_code")
public class QualityDefectCode extends BaseEntity {

    /** 缺陷代码。 */
    private String defectCode;

    /** 缺陷名称。 */
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

    /** 严重度：minor/major/critical。 */
    private String severity;

    /** 状态：0-停用 1-启用。 */
    private Integer status;

    private String remark;
}
