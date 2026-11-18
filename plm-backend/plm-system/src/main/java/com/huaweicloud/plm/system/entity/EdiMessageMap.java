package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * EDI 报文映射与标准化（N6，DEV-067）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("edi_message_map")
public class EdiMessageMap extends BaseEntity {

    /** 映射编码。 */
    private String mapCode;

    /** 映射名称。 */
    private String mapName;

    /** 伙伴编码，* 表示通用。 */
    private String partnerCode;

    /** 交易代码。 */
    private String transCode;

    /** 标准：X12/EDIFACT。 */
    private String standard;

    /** 方向：INBOUND/OUTBOUND。 */
    private String direction;

    /** 作用域：HEADER/LINE。 */
    private String scope;

    /** 源字段路径。 */
    private String sourcePath;

    /** 目标字段。 */
    private String targetField;

    /** 转换类型：DIRECT/DICT/DATE/CONST。 */
    private String transformType;

    /** 字典类型（DICT 转换时使用）。 */
    private String dictType;

    /** 日期格式（DATE 转换时使用）。 */
    private String datePattern;

    /** 默认值。 */
    private String defaultValue;

    /** 是否必填：1 是 / 0 否。 */
    private Integer requiredFlag;

    /** 排序号。 */
    private Integer sortNo;

    /** 状态：1 启用 / 0 停用。 */
    private Integer status;

    private String remark;
}
