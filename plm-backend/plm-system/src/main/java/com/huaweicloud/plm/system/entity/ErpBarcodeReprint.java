package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * ERP 条码管理—补打记录（对应 G3-N7a ERP 条码管理）：
 * 登记条码补打单号、原条码、补打原因与补打次数，支撑条码补打追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_barcode_reprint")
public class ErpBarcodeReprint extends BaseEntity {

    /** 补打单号（唯一，为空时自动生成）。 */
    private String reprintNo;

    /** 条码编号。 */
    private String barcodeNo;

    /** 补打原因。 */
    private String reprintReason;

    /** 补打次数，默认 1。 */
    private Integer reprintCount;

    /** 补打时间。 */
    private LocalDateTime reprintTime;

    /** 操作人姓名。 */
    private String operatorName;

    /** 审批状态，默认 NONE。 */
    private String approvalStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
