package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 主数据编码发放分页查询条件（G1-N8 主数据平台 T007 编码发放）。
 * keyword 匹配 issueNo/masterCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysMdmCodeIssueQuery extends PageQuery {

    /** 主数据域编码。 */
    private String domainCode;

    /** 编码标准编码。 */
    private String standardCode;

    /** 发放状态。 */
    private String issueStatus;
}
