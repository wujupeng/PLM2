package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 供应商保存请求。
 */
@Data
public class SupplierSaveRequest {

    @NotBlank(message = "供应商编码不能为空")
    private String supplierCode;

    @NotBlank(message = "供应商名称不能为空")
    private String supplierName;

    private String contact;

    private String phone;

    private String email;

    /** 状态：1=启用，0=停用。 */
    private Integer status;

    private String remark;
}
