package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 扫描校验分页查询条件（对应 G3-N7a ERP 条码管理）。
 * keyword 匹配 scanNo/barcodeNo/materialCode/scanner。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpBarcodeScanQuery extends PageQuery {

    /** 扫描类型。 */
    private String scanType;

    /** 扫描结果。 */
    private String scanResult;

    /** 条码编号。 */
    private String barcodeNo;
}
