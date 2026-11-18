package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.ErpPurchaseOrderLine;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 采购订单行 Mapper（对应 WBS T023 采购管理、T093 采购到货入库，属 G3 ERP）。
 */
@Mapper
public interface ErpPurchaseOrderLineMapper extends BaseMapper<ErpPurchaseOrderLine> {

    /**
     * 查询指定采购订单下当前最大行号，用于新增行时自动取号。
     */
    @Select("SELECT MAX(line_no) FROM erp_purchase_order_line WHERE order_id = #{fk} AND deleted = 0")
    Integer selectMaxLineNo(@Param("fk") Long fk);
}
