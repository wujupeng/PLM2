package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.BomHeader;
import com.huaweicloud.plm.system.entity.BomLine;
import lombok.Data;

import java.util.List;

/**
 * BOM 详情：头信息与行项目。
 */
@Data
public class BomDetailResponse {

    private BomHeader header;

    private List<BomLine> lines;
}
