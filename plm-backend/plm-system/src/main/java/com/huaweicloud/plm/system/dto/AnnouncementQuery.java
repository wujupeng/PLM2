package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 公告分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class AnnouncementQuery extends PageQuery {

    private String category;

    private String publishStatus;
}
