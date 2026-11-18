package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 存量系统分页查询条件（G1-N7 治理中心 T002 现状盘点）。
 * keyword 匹配 systemNo/systemCode/systemName/vendor。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysGovAsisSystemQuery extends PageQuery {

    /** 系统类型：ERP/PLM/OA/MES/WMS/SRM/OTHER。 */
    private String systemType;

    /** 系统状态。 */
    private String systemStatus;
}
