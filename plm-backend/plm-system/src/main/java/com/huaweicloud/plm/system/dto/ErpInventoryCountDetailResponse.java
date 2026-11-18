package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.ErpInventoryCount;
import com.huaweicloud.plm.system.entity.ErpInventoryCountLine;
import lombok.Data;

import java.util.List;

/**
 * 库存盘点详情：头信息与行项目（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 */
@Data
public class ErpInventoryCountDetailResponse {

    private ErpInventoryCount header;

    private List<ErpInventoryCountLine> lines;
}
