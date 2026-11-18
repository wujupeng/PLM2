package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 图文档发布请求。
 */
@Data
public class DocReleaseRequest {

    /** 版本号，为空时取文档当前版本。 */
    private String versionNo;

    /** 发布说明。 */
    private String comment;
}
