package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 相册分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class AlbumQuery extends PageQuery {

    private String albumStatus;
}
