package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * EDI 伙伴分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class EdiPartnerQuery extends PageQuery {

    /** 伙伴类型：CUSTOMER/SUPPLIER。 */
    private String partnerType;

    /** 传输协议：SFTP/AS2/API。 */
    private String protocol;

    /** 状态：enabled/disabled。 */
    private String status;
}
