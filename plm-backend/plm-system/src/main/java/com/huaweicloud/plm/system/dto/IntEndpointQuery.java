package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** 接口配置分页查询条件（N9，DEV-096）。 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntEndpointQuery extends PageQuery {

    /** 接口编码。 */
    private String endpointCode;

    /** 所属域：PLM/ERP/MES/QMS/EDI。 */
    private String domain;

    /** 方向：INBOUND/OUTBOUND。 */
    private String direction;

    /** 协议：REST/SOAP/FILE/MQ。 */
    private String protocol;

    /** 状态：enabled/disabled。 */
    private String status;
}
