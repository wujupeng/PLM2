package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.List;

/**
 * 图文档版本比较返回。
 */
@Data
public class DocVersionCompareResponse {

    /** 左版本号。 */
    private String leftVersionNo;

    /** 右版本号。 */
    private String rightVersionNo;

    /** 字段差异列表。 */
    private List<DocVersionFieldDiff> diffs;
}
