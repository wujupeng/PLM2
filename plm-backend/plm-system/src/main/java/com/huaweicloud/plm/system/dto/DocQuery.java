package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class DocQuery extends PageQuery {

    private Long folderId;

    /** 是否包含子目录，默认 false。 */
    private Boolean includeSub;

    private String docType;

    private String status;

    private Long ownerUserId;

    private String tag;

    /** 创建时间起止（yyyy-MM-dd）。 */
    private String startDate;

    private String endDate;
}
