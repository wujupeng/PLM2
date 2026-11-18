package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.ErpDeliveryOrderLine;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 发货单行 Mapper（G3-N2 ERP 销售管理）。
 */
@Mapper
public interface ErpDeliveryOrderLineMapper extends BaseMapper<ErpDeliveryOrderLine> {

    /**
     * 查询指定发货单下当前最大行号，用于新增行时自动取号。
     */
    @Select("SELECT MAX(line_no) FROM erp_delivery_order_line WHERE delivery_id = #{deliveryId} AND deleted = 0")
    Integer selectMaxLineNo(@Param("deliveryId") Long deliveryId);
}
