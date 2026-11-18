package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 移动场景分页查询条件（G1-N6 WBS T106 移动端与PDA）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MobileSceneQuery extends PageQuery {

    /** 扫码类型：RECEIVE/SHELVE/STOCKTAKE/PICK/REPORT/LABEL_CHECK。 */
    private String scanType;

    /** 场景状态：ACTIVE/DISABLED。 */
    private String sceneStatus;

    /** 所属业务模块。 */
    private String bizModule;
}
