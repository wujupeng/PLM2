package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.EdiAsn;
import com.huaweicloud.plm.system.entity.EdiAsnLine;
import lombok.Data;

import java.util.List;

/**
 * ASN 详情：主表与明细行。
 */
@Data
public class EdiAsnDetailResponse {

    private EdiAsn asn;

    private List<EdiAsnLine> lines;
}
