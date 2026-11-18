package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 门户消息分页查询条件（对应门户消息）。
 * keyword 匹配 messageNo/supplierCode/supplierName/title/bizNo。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmPortalMessageQuery extends PageQuery {

    /** 消息类型。 */
    private String messageType;

    /** 消息状态。 */
    private String messageStatus;

    /** 供应商编码。 */
    private String supplierCode;

    /** 已读标志：0 未读 1 已读。 */
    private Integer readFlag;
}
