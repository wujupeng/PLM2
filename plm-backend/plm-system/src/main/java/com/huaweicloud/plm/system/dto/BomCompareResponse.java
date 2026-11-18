package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.BomHeader;
import com.huaweicloud.plm.system.entity.BomLine;
import lombok.Data;

import java.util.List;

/**
 * BOM 版本比较结果（DEV-028）。
 */
@Data
public class BomCompareResponse {

    private BomHeader headerA;

    private BomHeader headerB;

    /** 仅在 B 中存在的行。 */
    private List<BomLine> added;

    /** 仅在 A 中存在的行。 */
    private List<BomLine> removed;

    /** 两侧都存在但字段发生变化的明细。 */
    private List<BomCompareDiff> modified;
}
