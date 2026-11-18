package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 车间生产日报（OA-DEV-067，需与 MES 生产实绩对账并标注来源）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_biz_workshop_daily")
public class OaBizWorkshopDaily extends BaseEntity {

    /** 日报单号。 */
    private String reportNo;

    private LocalDate reportDate;

    private String workshop;

    private String shiftCode;

    private Long deptId;

    private String deptName;

    private BigDecimal planQty;

    private BigDecimal outputQty;

    private BigDecimal qualifiedQty;

    private BigDecimal defectQty;

    private BigDecimal completeRate;

    private Integer downtimeMinutes;

    private String abnormalDesc;

    /** 数据来源：MANUAL/MES 等。 */
    private String dataSource;

    /** 是否已对账：0/1。 */
    private Integer reconcileFlag;

    private Long reporterUserId;

    private String reporterName;

    private Long orgId;

    private String orgName;

    /** 日报状态：DRAFT/SUBMITTED 等。 */
    private String reportStatus;

    private String remark;
}
