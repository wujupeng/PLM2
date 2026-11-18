package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.MfgRecallImpact;
import com.huaweicloud.plm.system.entity.MfgRecallOrder;
import lombok.Data;

import java.util.List;

/**
 * 召回单详情响应（N8，DEV-094）。
 */
@Data
public class MfgRecallDetailResponse {

    private MfgRecallOrder recall;

    private List<MfgRecallImpact> impacts;
}
