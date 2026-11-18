package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 仓库管理保存请求（对应仓库）。
 */
@Data
public class WmsWarehouseSaveRequest {

    /** 仓库编码（为空时自动生成）。 */
    @NotBlank(message = "仓库编码不能为空")
    private String warehouseCode;

    /** 仓库名称。 */
    private String warehouseName;

    /** 仓库类型，为空默认 FINISHED。 */
    private String warehouseType;

    /** 仓库地址。 */
    private String address;

    /** 负责人。 */
    private String manager;

    /** 联系电话。 */
    private String contactPhone;

    /** 面积。 */
    private BigDecimal area;

    /** 仓库状态，为空默认 DRAFT。 */
    private String warehouseStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
