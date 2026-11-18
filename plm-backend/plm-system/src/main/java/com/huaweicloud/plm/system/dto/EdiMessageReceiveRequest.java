package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 接收 EDI 原始报文请求（N6，DEV-064/065）。
 */
@Data
public class EdiMessageReceiveRequest {

    /** 伙伴编码。 */
    @NotBlank(message = "伙伴编码不能为空")
    private String partnerCode;

    /** 交易代码，如 850/862。 */
    private String transCode;

    /** 控制号（报文内唯一标识，用于防重）。 */
    private String controlNo;

    /** 标准：X12/EDIFACT/XML/CSV，为空时取交易集配置。 */
    private String standard;

    /** 传输协议：SFTP/AS2/API。 */
    private String protocol;

    /** 文件名。 */
    private String fileName;

    /** 原始报文内容。 */
    @NotBlank(message = "报文内容不能为空")
    private String rawContent;

    /** 接收时间，为空取当前时间。 */
    private LocalDateTime receivedAt;

    /** 是否接收后立即解析，为空取配置 edi.auto_parse。 */
    private Boolean autoParse;

    private String remark;
}
