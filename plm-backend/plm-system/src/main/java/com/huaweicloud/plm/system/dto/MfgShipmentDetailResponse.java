package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.MfgShipment;
import com.huaweicloud.plm.system.entity.MfgShipmentLine;
import lombok.Data;

import java.util.List;

/**
 * 出货单详情响应（N8，DEV-090/091/092）。
 */
@Data
public class MfgShipmentDetailResponse {

    private MfgShipment shipment;

    private List<MfgShipmentLine> lines;
}
