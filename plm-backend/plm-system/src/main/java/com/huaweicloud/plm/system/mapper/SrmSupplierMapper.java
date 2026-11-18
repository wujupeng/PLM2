package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SrmSupplier;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 供应商主档 Mapper（对应 G4-N1 SRM 供应商全生命周期）。
 */
@Mapper
public interface SrmSupplierMapper extends BaseMapper<SrmSupplier> {

    /**
     * 物理删除供应商主档。
     * <p>
     * 供应商编码支持人工指定，且表上存在硬唯一索引；若采用逻辑删除，被删除行仍占用该编码，
     * 导致同一编码再次登记时触发唯一约束冲突。因此删除语义为「释放编码」，
     * 这里执行物理删除以保持与硬唯一索引一致。
     */
    @Delete("DELETE FROM srm_supplier WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
