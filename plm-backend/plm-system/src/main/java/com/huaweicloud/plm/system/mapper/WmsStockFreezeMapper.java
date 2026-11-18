package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.WmsStockFreeze;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 库存冻结 Mapper（对应库存冻结）。
 */
@Mapper
public interface WmsStockFreezeMapper extends BaseMapper<WmsStockFreeze> {

    /**
     * 物理删除库存冻结记录。
     * <p>
     * 冻结单号支持人工指定，且表上存在硬唯一索引；若采用逻辑删除，被删除行仍占用该编号，
     * 导致同一编号再次登记时触发唯一约束冲突。因此删除语义为「释放编码」，
     * 这里执行物理删除以保持与硬唯一索引一致。
     */
    @Delete("DELETE FROM wms_stock_freeze WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
