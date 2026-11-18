package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysDocTransition;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SysDocTransitionMapper extends BaseMapper<SysDocTransition> {

    /**
     * 物理删除单据状态流转规则。
     * <p>
     * 表上存在硬唯一索引 uk_sys_doc_transition_key（doc_type + from_state + action_code）；
     * 若采用逻辑删除，被删除行仍占用该组合键，导致同一流转规则再次登记时触发唯一约束冲突。
     * 因此删除语义为「释放编码」，这里执行物理删除以保持与唯一索引一致。
     */
    @Delete("DELETE FROM sys_doc_transition WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
