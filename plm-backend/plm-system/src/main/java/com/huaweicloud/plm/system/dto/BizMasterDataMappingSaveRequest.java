package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 主数据映射保存入参（OA-DEV-090）。
 */
@Data
public class BizMasterDataMappingSaveRequest {

    private String mappingNo;

    /** 对象类型：CUSTOMER/SUPPLIER/MATERIAL/ORDER/PURCHASE/PRICE。 */
    private String objectType;

    private String localCode;

    private String externalCode;

    private String authoritySystem;

    private String sourceSystem;

    /** 同步方向：INBOUND/OUTBOUND/BIDIRECTIONAL。 */
    private String syncDirection;

    private Integer status;

    private String remark;
}
