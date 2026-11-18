package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.ErpProductionOrderLine;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 生产订单行 Mapper（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）。
 */
@Mapper
public interface ErpProductionOrderLineMapper extends BaseMapper<ErpProductionOrderLine> {

    /**
     * 查询指定生产订单下当前最大行号，用于新增行时自动取号。
     */
    @Select("SELECT MAX(line_no) FROM erp_production_order_line WHERE order_id = #{fk} AND deleted = 0")
    Integer selectMaxLineNo(@Param("fk") Long fk);
}
