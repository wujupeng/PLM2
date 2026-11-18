package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 统一检索索引：索引文档元数据与邮件正文/附件名，检索时按权限过滤。
 * 说明：默认为关系库精简索引，生产可替换为独立搜索引擎，替换不改变上层接口。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_doc_search_index")
public class OaDocSearchIndex extends BaseEntity {

    /** 来源类型：DOCUMENT/MAIL。 */
    private String sourceType;

    private Long sourceId;

    private String bizNo;

    private String title;

    private String contentText;

    private String keywords;

    private Long folderId;

    private Long docId;

    private Long ownerUserId;

    private Long ownerDeptId;

    /** 权限范围：PUBLIC=全员可检索，PRIVATE=仅属主与授权人可检索。 */
    private String permissionScope;

    private LocalDateTime indexedAt;

    private String remark;
}
