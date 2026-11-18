package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 测试结果保存请求（N8，DEV-087）。
 */
@Data
public class MfgTestSaveRequest {

    /** 结果编号（可选，留空自动生成）。 */
    private String resultNo;

    @NotBlank(message = "生产批次号不能为空")
    private String batchNo;

    /** 序列号。 */
    private String serialNo;

    /** 产品编码。 */
    private String productCode;

    /** 工序编码。 */
    private String operationCode;

    /** 工序名称。 */
    private String operationName;

    /** 测试类型：ELECTRICAL/DIMENSION/ASSEMBLY/WELDING/POTTING/FUNCTION。 */
    private String testType;

    @NotBlank(message = "测试项编码不能为空")
    private String testItemCode;

    /** 测试项名称。 */
    private String testItemName;

    /** 标准值（文本）。 */
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

    /** 结果：OK/NG（留空时按上下限自动判定）。 */
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
