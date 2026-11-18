package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.List;

/**
 * 文档详情：元数据、版本、评论、分享与当前用户有效权限（OA-UAT-05 版本记录与访问审计）。
 */
@Data
public class DocDetailResponse {

    private DocItem doc;

    private List<DocVersionItem> versions;

    private List<DocCommentItem> comments;

    private List<DocShareItem> shares;

    /** 当前用户对该文档的有效权限级别：READ/WRITE/MANAGE。 */
    private String effectivePermission;

    /** 是否允许下载原文件（无权限或被撤销分享时为 false）。 */
    private Boolean downloadAllowed;
}
