package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * CAD 文件保存请求。
 */
@Data
public class CadFileSaveRequest {

    /** CAD 文件编号，为空时自动生成。 */
    private String cadNo;

    @NotBlank(message = "文件名不能为空")
    private String fileName;

    /** 文件存储路径。 */
    private String filePath;

    /** 文件格式。 */
    private String fileFormat;

    /** CAD 软件。 */
    private String cadSoftware;

    /** 软件版本。 */
    private String softwareVersion;

    /** 兼容版本范围。 */
    private String compatRange;

    /** 文件大小（字节）。 */
    private Long fileSize;

    /** 文件摘要（哈希）。 */
    private String fileHash;

    /** 关联图文档 ID。 */
    private Long documentId;

    /** 关联图文档编号。 */
    private String docNo;

    /** 关联产品编码。 */
    private String productCode;

    /** 关联物料编码。 */
    private String materialCode;

    private String remark;
}
