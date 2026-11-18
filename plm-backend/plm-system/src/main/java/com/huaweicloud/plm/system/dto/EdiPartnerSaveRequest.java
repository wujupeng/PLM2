package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

/**
 * EDI 伙伴保存请求。
 */
@Data
public class EdiPartnerSaveRequest {

    @NotBlank(message = "伙伴编码不能为空")
    private String partnerCode;

    @NotBlank(message = "伙伴名称不能为空")
    private String partnerName;

    /** 伙伴类型：CUSTOMER/SUPPLIER。 */
    private String partnerType;

    /** 伙伴业务标识。 */
    private String partnerId;

    /** 传输协议：SFTP/AS2/API。 */
    private String protocol;

    /** 接入地址。 */
    private String endpoint;

    /** 端口。 */
    private Integer port;

    /** 远程路径。 */
    private String remotePath;

    /** 登录用户名。 */
    private String username;

    /** 密钥引用（不落明文）。 */
    private String secretRef;

    /** 证书主题。 */
    private String certSubject;

    /** 证书到期日期。 */
    private LocalDate certExpireDate;

    /** 字符集，默认 UTF-8。 */
    private String charset;

    /** 联系人。 */
    private String contact;

    /** 联系邮箱。 */
    private String email;

    /** 状态：enabled/disabled。 */
    private String status;

    private String remark;
}
