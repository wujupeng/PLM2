package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 主数据映射（OA-DEV-090，明确权威源与同步方向）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_master_data_mapping")
public class OaMasterDataMapping extends BaseEntity {

    /** 映射编号。 */
    private String mappingNo;

    /** 对象类型：CUSTOMER/SUPPLIER/MATERIAL/ORDER/PURCHASE/PRICE。 */
    private String objectType;

    /** 本地编码。 */
    private String localCode;

    /** 外部编码。 */
    private String externalCode;

    /** 权威系统。 */
    private String authoritySystem;

    /** 来源系统。 */
    private String sourceSystem;

    /** 同步方向：INBOUND/OUTBOUND/BIDIRECTIONAL。 */
    private String syncDirection;

    /** 状态：0 停用 / 1 启用。 */
    private Integer status;

    /** 最近同步时间。 */
    private LocalDateTime lastSyncTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
