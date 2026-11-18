package com.huaweicloud.plm.system.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

/**
 * 车间生产日报保存入参（OA-DEV-067）。需与 MES 生产实绩对账并标注数据来源。
 */
@Data
public class BizWorkshopDailySaveRequest {

    private LocalDate reportDate;

    private String workshop;

    private String shiftCode;

    private Long deptId;

    private String deptName;

    private BigDecimal planQty;

    private BigDecimal outputQty;

    private BigDecimal qualifiedQty;

    private BigDecimal defectQty;

    private Integer downtimeMinutes;

    private String abnormalDesc;

    /** 数据来源：oa_data_source（MANUAL/MES/ERP/QMS/PLM）。 */
    private String dataSource;

    private Long reporterUserId;

    private String remark;
}
