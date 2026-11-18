package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.ErpPurchaseRequisition;
import com.huaweicloud.plm.system.entity.ErpPurchaseRequisitionLine;
import lombok.Data;

import java.util.List;

/**
 * 请购单详情：头信息与行项目（对应 WBS T023 采购管理、T093 采购到货入库，属 G3 ERP）。
 */
@Data
public class ErpPurchaseRequisitionDetailResponse {

    private ErpPurchaseRequisition header;

    private List<ErpPurchaseRequisitionLine> lines;
}
