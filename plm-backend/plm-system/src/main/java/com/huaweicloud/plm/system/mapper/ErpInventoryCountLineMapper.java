package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.ErpInventoryCountLine;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 库存盘点行 Mapper（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 */
@Mapper
public interface ErpInventoryCountLineMapper extends BaseMapper<ErpInventoryCountLine> {

    /**
     * 查询指定库存盘点单下当前最大行号，用于新增行时自动取号。
     */
    @Select("SELECT MAX(line_no) FROM erp_inventory_count_line WHERE count_id = #{fk} AND deleted = 0")
    Integer selectMaxLineNo(@Param("fk") Long fk);
}
