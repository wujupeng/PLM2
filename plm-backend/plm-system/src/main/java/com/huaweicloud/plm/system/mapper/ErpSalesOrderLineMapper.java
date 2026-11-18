package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.ErpSalesOrderLine;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 销售订单行 Mapper（G3-N2 ERP 销售管理）。
 */
@Mapper
public interface ErpSalesOrderLineMapper extends BaseMapper<ErpSalesOrderLine> {

    /**
     * 查询指定销售订单下当前最大行号，用于新增行时自动取号。
     */
    @Select("SELECT MAX(line_no) FROM erp_sales_order_line WHERE order_id = #{orderId} AND deleted = 0")
    Integer selectMaxLineNo(@Param("orderId") Long orderId);
}
