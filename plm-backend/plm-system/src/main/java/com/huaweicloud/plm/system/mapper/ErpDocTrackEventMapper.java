package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.ErpDocTrackEvent;
import org.apache.ibatis.annotations.Mapper;

/**
 * 业务事件 Mapper（对应 WBS G3-N7a ERP 业务单据追踪）。
 * 表上无业务编码唯一索引，删除走 BaseMapper 逻辑删除。
 */
@Mapper
public interface ErpDocTrackEventMapper extends BaseMapper<ErpDocTrackEvent> {
}
