package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 图文档保存请求。
 */
@Data
public class DocDocumentSaveRequest {

    @NotBlank(message = "图文档编号不能为空")
    private String docNo;

    @NotBlank(message = "图文档名称不能为空")
    private String docName;

    /** 分类 ID。 */
    private Long categoryId;

    /** 分类编码。 */
    private String categoryCode;

    /** 图文档类型。 */
    private String docType;

    /** 关联产品编码。 */
    private String productCode;

    /** 关联物料编码。 */
    private String materialCode;

    /** 关联 BOM 头 ID。 */
    private Long bomHeaderId;

    /** 关联 BOM 编码。 */
    private String bomCode;

    /** 文件名。 */
    private String fileName;

    /** 负责人名称。 */
    private String ownerName;

    /** 是否受控分发：0-否 1-是。 */
    private Integer distributionControlled;

    /** 图文档描述。 */
    private String description;

    private String remark;
}
