package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.EcoChangeItem;
import com.huaweicloud.plm.system.entity.EcoChangeOrder;
import com.huaweicloud.plm.system.entity.EcoImpactAnalysis;
import com.huaweicloud.plm.system.entity.EcoNotice;
import lombok.Data;

import java.util.List;

/**
 * 工程变更单（ECO）详情：变更单、变更明细、通知与影响分析。
 */
@Data
public class EcoDetailResponse {

    private EcoChangeOrder order;

    private List<EcoChangeItem> items;

    private List<EcoNotice> notices;

    private List<EcoImpactAnalysis> impacts;
}
