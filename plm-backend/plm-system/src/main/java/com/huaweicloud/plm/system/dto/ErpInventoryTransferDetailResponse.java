package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.ErpInventoryTransfer;
import com.huaweicloud.plm.system.entity.ErpInventoryTransferLine;
import lombok.Data;

import java.util.List;

/**
 * 库存调拨详情：头信息与行项目（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 */
@Data
public class ErpInventoryTransferDetailResponse {

    private ErpInventoryTransfer header;

    private List<ErpInventoryTransferLine> lines;
}
