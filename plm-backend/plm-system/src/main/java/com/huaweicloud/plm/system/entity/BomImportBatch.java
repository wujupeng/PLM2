package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * BOM 单阶导入批次（DEV-025）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("bom_import_batch")
public class BomImportBatch extends BaseEntity {

    /** 批次号。 */
    private String batchNo;

    /** BOM 类型：EBOM/MBOM。 */
    private String bomType;

    /** 源文件名称，用于溯源。 */
    private String sourceFile;

    /** 产品编码。 */
    private String productCode;

    /** 源文件总行数。 */
    private Integer totalRows;

    /** 成功行数。 */
    private Integer successRows;

    /** 失败行数。 */
    private Integer failRows;

    /** 批次状态：pending/success/partial/failed。 */
    private String status;

    /** 导入生成的 BOM 头 ID。 */
    private Long headerId;

    private String remark;
}
