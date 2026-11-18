package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.ErpGoodsReceipt;
import com.huaweicloud.plm.system.entity.ErpGoodsReceiptLine;
import lombok.Data;

import java.util.List;

/**
 * 采购到货单详情：头信息与行项目（G3-N3a ERP 采购管理）。
 */
@Data
public class ErpGoodsReceiptDetailResponse {

    private ErpGoodsReceipt header;

    private List<ErpGoodsReceiptLine> lines;
}
