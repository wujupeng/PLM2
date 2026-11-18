package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 关键参数与测试结果（N8，DEV-087）：电气、尺寸、装配、焊接、点胶灌封等检验/工艺数据。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mfg_test_result")
public class MfgTestResult extends BaseEntity {

    /** 结果编号（唯一）。 */
    private String resultNo;

    /** 生产批次号。 */
    private String batchNo;

    /** 序列号（单件级）。 */
    private String serialNo;

    /** 产品编码。 */
    private String productCode;

    /** 工序编码。 */
    private String operationCode;

    /** 工序名称。 */
    private String operationName;

    /** 测试类型：ELECTRICAL/DIMENSION/ASSEMBLY/WELDING/POTTING/FUNCTION。 */
    private String testType;

    /** 测试项编码。 */
    private String testItemCode;

    /** 测试项名称。 */
    private String testItemName;

    /** 标准值（文本描述）。 */
    private String standardValue;

    /** 下限。 */
    private BigDecimal lowerLimit;

    /** 上限。 */
    private BigDecimal upperLimit;

    /** 实测值（数值）。 */
    private BigDecimal actualValue;

    /** 实测值（文本）。 */
    private String actualText;

    /** 单位。 */
    private String unit;

    /** 结果：OK/NG。 */
    private String result;

    /** 设备编码。 */
    private String equipmentCode;

    /** 测试人员。 */
    private String tester;

    /** 测试时间。 */
    private LocalDateTime testedAt;

    /** 来源系统。 */
    private String sourceSystem;

    /** 附件地址。 */
    private String attachmentUrl;

    private String remark;
}
