package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.ErpOutsourceOrderLine;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 委外订单行 Mapper（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）。
 */
@Mapper
public interface ErpOutsourceOrderLineMapper extends BaseMapper<ErpOutsourceOrderLine> {

    /**
     * 查询指定委外订单下当前最大行号，用于新增行时自动取号。
     */
    @Select("SELECT MAX(line_no) FROM erp_outsource_order_line WHERE order_id = #{fk} AND deleted = 0")
    Integer selectMaxLineNo(@Param("fk") Long fk);
}
