package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * CAD 图纸文件（DEV-033 ~ DEV-038 CAD 集成）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cad_file")
public class CadFile extends BaseEntity {

    /** CAD 文件编号。 */
    private String cadNo;

    /** 文件名。 */
    private String fileName;

    /** 文件存储路径。 */
    private String filePath;

    /** 文件格式，如 dwg/stp。 */
    private String fileFormat;

    /** CAD 软件，如 AutoCAD/SolidWorks。 */
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

    /** 属性提取状态：pending/success/partial/failed。 */
    private String extractStatus;

    /** 属性提取结果说明。 */
    private String extractMessage;

    /** 提取到的属性 JSON。 */
    private String extractedJson;

    private String remark;
}
