package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SrmIncomingQuality;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 来料质量 Mapper（对应来料质量）。
 */
@Mapper
public interface SrmIncomingQualityMapper extends BaseMapper<SrmIncomingQuality> {

    /**
     * 物理删除来料检验单记录。
     * <p>
     * 来料检验单号支持人工指定，且表上存在硬唯一索引；若采用逻辑删除，被删除行仍占用该编号，
     * 导致同一编号再次登记时触发唯一约束冲突。因此删除语义为「释放编码」，
     * 这里执行物理删除以保持与硬唯一索引一致。
     */
    @Delete("DELETE FROM srm_incoming_quality WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
