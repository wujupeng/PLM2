package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.WmsStocktakeOrder;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 盘点单 Mapper。
 */
@Mapper
public interface WmsStocktakeOrderMapper extends BaseMapper<WmsStocktakeOrder> {

    /**
     * 物理删除盘点单记录。
     * <p>
     * 单号支持人工指定且表上存在硬唯一索引；逻辑删除会让被删行继续占用单号，
     * 导致同一单号再次登记时触发唯一约束冲突。因此删除语义为「释放编码」，
     * 这里执行物理删除以保持与硬唯一索引一致。
     */
    @Delete("DELETE FROM wms_stocktake_order WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
