package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.SpecInstance;
import com.huaweicloud.plm.system.entity.SpecInstanceValue;
import lombok.Data;

import java.util.List;

/**
 * 技术规格实例详情：实例本体与取值列表。
 */
@Data
public class SpecInstanceDetailResponse {

    private SpecInstance instance;

    private List<SpecInstanceValue> values;
}
