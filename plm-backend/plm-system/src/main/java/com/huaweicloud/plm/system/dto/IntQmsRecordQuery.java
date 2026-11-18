package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** QMS 质量记录分页查询条件（N9，DEV-097）。 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntQmsRecordQuery extends PageQuery {

    /** 质量记录编号。 */
    private String recordNo;

    /** 记录类型：INCOMING/IN_PROCESS/FINAL/COMPLAINT/SUPPLIER。 */
    private String recordType;

    /** 产品编码。 */
    private String productCode;

    /** 物料编码。 */
    private String materialCode;

    /** 批次号。 */
    private String batchNo;

    /** 检验结果：PASS/FAIL/CONCESSION。 */
    private String result;

    /** 缺陷等级：CRITICAL/MAJOR/MINOR。 */
    private String defectLevel;

    /** 接口状态：RECEIVED/PROCESSED/FAILED。 */
    private String interfaceStatus;

    /** 来源系统。 */
    private String sourceSystem;
}
