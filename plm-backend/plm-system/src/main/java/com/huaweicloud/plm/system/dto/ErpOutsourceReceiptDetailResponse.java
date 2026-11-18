package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.ErpOutsourceReceipt;
import com.huaweicloud.plm.system.entity.ErpOutsourceReceiptLine;
import lombok.Data;

import java.util.List;

/**
 * 委外到货单详情：头信息与行项目（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）。
 */
@Data
public class ErpOutsourceReceiptDetailResponse {

    private ErpOutsourceReceipt header;

    private List<ErpOutsourceReceiptLine> lines;
}
