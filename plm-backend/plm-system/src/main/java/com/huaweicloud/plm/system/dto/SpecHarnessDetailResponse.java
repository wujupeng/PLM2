package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.SpecHarness;
import com.huaweicloud.plm.system.entity.SpecHarnessTerminal;
import lombok.Data;

import java.util.List;

/**
 * 线束端子明细返回组合。
 */
@Data
public class SpecHarnessDetailResponse {

    /** 线束本体。 */
    private SpecHarness harness;

    /** 端子明细列表。 */
    private List<SpecHarnessTerminal> terminals;
}
