package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysDocStateDef;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SysDocStateDefMapper extends BaseMapper<SysDocStateDef> {

    /**
     * 物理删除单据状态定义。
     * <p>
     * 表上存在硬唯一索引 uk_sys_doc_state_def_key（doc_type + state_code）；
     * 若采用逻辑删除，被删除行仍占用该组合键，导致同一「单据类型 + 状态编码」再次登记时触发唯一约束冲突。
     * 因此删除语义为「释放编码」，这里执行物理删除以保持与唯一索引一致。
     */
    @Delete("DELETE FROM sys_doc_state_def WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
