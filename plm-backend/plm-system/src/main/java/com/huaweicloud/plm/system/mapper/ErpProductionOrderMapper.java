package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.ErpProductionOrder;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 生产订单头 Mapper（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）。
 */
@Mapper
public interface ErpProductionOrderMapper extends BaseMapper<ErpProductionOrder> {

    /**
     * 物理删除生产订单头。
     * <p>
     * 生产订单号支持人工指定，且表上存在硬唯一索引；若采用逻辑删除，被删除行仍占用该单号，
     * 导致同一单号再次登记时触发唯一约束冲突。因此删除语义为「释放编码」，
     * 这里执行物理删除以保持与硬唯一索引一致。
     */
    @Delete("DELETE FROM erp_production_order WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
