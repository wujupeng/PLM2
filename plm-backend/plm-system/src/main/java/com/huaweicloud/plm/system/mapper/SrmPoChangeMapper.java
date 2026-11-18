package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SrmPoChange;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 变更确认 Mapper（对应变更确认）。
 */
@Mapper
public interface SrmPoChangeMapper extends BaseMapper<SrmPoChange> {

    /**
     * 物理删除变更确认记录。
     * <p>
     * 变更编号支持人工指定，且表上存在硬唯一索引；若采用逻辑删除，被删除行仍占用该编号，
     * 导致同一编号再次登记时触发唯一约束冲突。因此删除语义为「释放编码」，
     * 这里执行物理删除以保持与硬唯一索引一致。
     */
    @Delete("DELETE FROM srm_po_change WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
