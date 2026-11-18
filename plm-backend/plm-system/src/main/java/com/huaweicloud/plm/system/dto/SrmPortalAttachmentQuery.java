package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 门户附件分页查询条件（对应门户附件）。
 * keyword 匹配 attachmentNo/bizNo/fileName/supplierCode/supplierName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmPortalAttachmentQuery extends PageQuery {

    /** 业务类型。 */
    private String bizType;

    /** 附件状态。 */
    private String attachmentStatus;

    /** 供应商编码。 */
    private String supplierCode;

    /** 关联业务单号。 */
    private String bizNo;
}
