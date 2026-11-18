package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** 缺陷分页查询条件（N9，DEV-106）。 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntDefectQuery extends PageQuery {

    /** 缺陷编号。 */
    private String defectNo;

    /** 缺陷来源。 */
    private String source;

    /** 严重程度。 */
    private String severity;

    /** 状态。 */
    private String status;

    /** 处理人。 */
    private String assignee;

    /** 是否超期：1 超期 / 0 未超期。 */
    private Integer slaBreached;
}
