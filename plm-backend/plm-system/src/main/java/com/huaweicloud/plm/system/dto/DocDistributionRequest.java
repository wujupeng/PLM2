package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 图文档分发请求。
 */
@Data
public class DocDistributionRequest {

    @NotBlank(message = "版本号不能为空")
    private String versionNo;

    @NotBlank(message = "接收方类型不能为空")
    private String recipientType;

    /** 接收方编码。 */
    private String recipientCode;

    /** 接收方名称。 */
    private String recipientName;

    private String remark;
}
