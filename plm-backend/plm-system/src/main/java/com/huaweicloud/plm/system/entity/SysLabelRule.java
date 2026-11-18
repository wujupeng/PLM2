package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 标签校验规则（G1-N6 公共平台底座—通用能力 WBS T106 移动端与PDA）：
 * 登记条码标签类型（MATERIAL 物料/PRODUCT 产品/BOX 箱码/WAREHOUSE 库位）与校验类型
 * （FORMAT 格式/CHECKSUM 校验位/LENGTH 长度/PREFIX 前缀）、期望长度与异常级别，
 * 供移动端扫码时统一校验条码合法性（如 14 位零件号、28 位追溯码）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_label_rule")
public class SysLabelRule extends BaseEntity {

    /** 规则编号（唯一，支持人工指定）。 */
    private String ruleNo;

    /** 规则编码。 */
    private String ruleCode;

    /** 规则名称。 */
    private String ruleName;

    /** 标签类型：MATERIAL/PRODUCT/BOX/WAREHOUSE，默认 MATERIAL。 */
    private String labelType;

    /** 校验类型：FORMAT/CHECKSUM/LENGTH/PREFIX，默认 FORMAT。 */
    private String checkType;

    /** 条码模式：正则（FORMAT）或前缀（PREFIX）。 */
    private String barcodePattern;

    /** 期望长度（LENGTH 校验）。 */
    private Integer expectedLength;

    /** 异常级别：ERROR/WARN，默认 ERROR。 */
    private String errorLevel;

    /** 规则状态：ACTIVE/DISABLED，默认 ACTIVE。 */
    private String ruleStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
