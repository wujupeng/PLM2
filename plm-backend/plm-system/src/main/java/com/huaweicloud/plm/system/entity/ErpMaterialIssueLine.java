package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * ERP 生产管理—材料领用单行（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）：
 * 记录领用行的物料、规格、单位、领用数量与仓库等信息，隶属材料领用单头 {@link ErpMaterialIssue}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_material_issue_line")
public class ErpMaterialIssueLine extends BaseEntity {

    /** 所属领料单头 ID。 */
    private Long issueId;

    /** 所属领料单号（冗余，便于查询展示）。 */
    private String issueNo;

    /** 行号。 */
    private Integer lineNo;

    /** 行状态，默认 OPEN。 */
    private String lineStatus;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，默认 PCS。 */
    private String uom;

    /** 领用数量，默认 0。 */
    private BigDecimal issueQty;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 备注。 */
    private String remark;
}
