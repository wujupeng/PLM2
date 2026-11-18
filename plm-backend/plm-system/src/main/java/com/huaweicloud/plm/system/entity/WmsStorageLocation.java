package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 库位/货架主数据（N7，DEV-075）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_storage_location")
public class WmsStorageLocation extends BaseEntity {

    /** 库位编码（唯一）。 */
    private String locationCode;

    /** 库位名称。 */
    private String locationName;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库区编码。 */
    private String areaCode;

    /** 货架编码。 */
    private String rackCode;

    /** 层编码。 */
    private String levelCode;

    /** 格口编码。 */
    private String binCode;

    /** 库位类型：RACK/STORAGE/STAGING/LINE_SIDE/RECEIVING。 */
    private String locationType;

    /** 关联产线（线边库位）。 */
    private String lineCode;

    /** 容量。 */
    private BigDecimal capacity;

    /** 状态：enabled/disabled。 */
    private String status;

    private String remark;
}
