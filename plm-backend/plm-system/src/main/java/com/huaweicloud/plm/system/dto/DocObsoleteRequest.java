package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 图文档作废请求。
 */
@Data
public class DocObsoleteRequest {

    /** 作废说明。 */
    private String comment;
}
