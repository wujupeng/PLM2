package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** 交付物保存请求（N9，DEV-105）。 */
@Data
public class IntDeliveryItemSaveRequest {

    /** 交付物编号（留空则自动生成）。 */
    private String itemNo;

    /** 交付类别。 */
    @NotBlank(message = "交付类别不能为空")
    private String category;

    /** 交付物名称。 */
    @NotBlank(message = "交付物名称不能为空")
    private String name;

    /** 版本。 */
    private String version;

    /** 文件路径。 */
    private String filePath;

    /** 校验和。 */
    private String checksum;

    /** 备注。 */
    private String remark;
}
