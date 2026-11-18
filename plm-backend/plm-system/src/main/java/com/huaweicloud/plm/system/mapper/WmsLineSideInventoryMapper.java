package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.WmsLineSideInventory;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 线边仓库存 Mapper。
 */
@Mapper
public interface WmsLineSideInventoryMapper extends BaseMapper<WmsLineSideInventory> {

    /**
     * 物理删除线边仓库存记录。
     * <p>
     * 线边仓库存按物料/批次/产线维度登记，删除语义为「移除该维度库存台账」，
     * 这里执行物理删除以避免逻辑删除残留影响库存口径统计。
     */
    @Delete("DELETE FROM wms_line_side_inventory WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
