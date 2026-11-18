package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * BOM 多级展开节点（DEV-026）。
 */
@Data
public class BomExpandNode {

    private String materialCode;

    private String materialName;

    private BigDecimal qty;

    private String unit;

    /** 层级，从 1 开始。 */
    private int level;

    /** 展开路径，形如 SP-A100/M-0001/M-0002。 */
    private String path;

    private List<BomExpandNode> children;
}
