package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * BOM 导入错误明细（DEV-025）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("bom_import_error")
public class BomImportError extends BaseEntity {

    /** 所属导入批次 ID。 */
    private Long batchId;

    /** 工作表名称。 */
    private String sheetName;

    /** 行号。 */
    private Integer rowNumber;

    /** 出错字段名。 */
    private String fieldName;

    /** 错误信息。 */
    private String errorMessage;

    /** 原始行内容。 */
    private String rawRow;
}
