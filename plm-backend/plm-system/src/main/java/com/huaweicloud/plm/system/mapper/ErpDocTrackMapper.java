package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.ErpDocTrack;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 单据追溯 Mapper（对应 WBS G3-N7a ERP 业务单据追踪）。
 */
@Mapper
public interface ErpDocTrackMapper extends BaseMapper<ErpDocTrack> {

    /**
     * 物理删除单据追溯记录。
     * <p>
     * 追溯号支持人工指定，且表上存在硬唯一索引；若采用逻辑删除，被删除行仍占用该追溯号，
     * 导致同一追溯号再次登记时触发唯一约束冲突。因此删除语义为「释放编码」，
     * 这里执行物理删除以保持与硬唯一索引一致。
     */
    @Delete("DELETE FROM erp_doc_track WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
