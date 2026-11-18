package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 文档访问审计查询入参：按文档、用户与动作过滤，作为验收与审计证据。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class DocAccessLogQuery extends PageQuery {

    private Long docId;

    private Long userId;

    /** 访问动作：VIEW/PREVIEW/DOWNLOAD/EDIT/DELETE/SHARE/RESTORE。 */
    private String action;

    /** 发生时间起止（yyyy-MM-dd）。 */
    private String startDate;

    private String endDate;
}
