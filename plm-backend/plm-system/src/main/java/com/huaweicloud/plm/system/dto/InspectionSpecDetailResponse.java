package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.InspectionItem;
import com.huaweicloud.plm.system.entity.InspectionSpec;
import lombok.Data;

import java.util.List;

/**
 * 检验规范详情：规范本体与检验项目明细。
 */
@Data
public class InspectionSpecDetailResponse {

    private InspectionSpec spec;

    private List<InspectionItem> items;
}
