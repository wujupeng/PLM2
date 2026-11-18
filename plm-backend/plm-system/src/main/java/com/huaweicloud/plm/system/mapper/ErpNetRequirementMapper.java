package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.ErpNetRequirement;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 净需求 Mapper（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）。
 */
@Mapper
public interface ErpNetRequirementMapper extends BaseMapper<ErpNetRequirement> {

    /**
     * 物理删除净需求。
     * <p>
     * 净需求单号支持人工指定，且表上存在硬唯一索引；若采用逻辑删除，被删除行仍占用该单号，
     * 导致同一单号再次登记时触发唯一约束冲突。因此删除语义为「释放编码」，
     * 这里执行物理删除以保持与硬唯一索引一致。
     */
    @Delete("DELETE FROM erp_net_requirement WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
