package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 统一检索入参：关键词必填，可按来源类型与目录范围收窄。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class DocSearchQuery extends PageQuery {

    /** 来源类型：DOCUMENT/MAIL，为空表示全部。 */
    private String sourceType;

    private Long folderId;

    /** 是否包含子目录，默认 false。 */
    private Boolean includeSub;

    private Long ownerUserId;

    /** 索引时间起止（yyyy-MM-dd）。 */
    private String startDate;

    private String endDate;
}
