package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysGovArchRelation;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SysGovArchRelationMapper extends BaseMapper<SysGovArchRelation> {

    /**
     * 物理删除架构关系。
     * <p>
     * 关系编号支持人工指定，且表上存在硬唯一索引 uk_sys_gov_arch_relation_no；
     * 若采用逻辑删除，被删除行仍占用该编号，导致同一编号再次登记时触发唯一约束冲突。
     * 因此删除语义为「释放编号」，这里执行物理删除以保持与唯一索引一致。
     */
    @Delete("DELETE FROM sys_gov_arch_relation WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
