package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysMfaBinding;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SysMfaBindingMapper extends BaseMapper<SysMfaBinding> {

    /**
     * 物理删除多因素认证绑定。
     * <p>
     * 绑定编号支持人工指定，且表上存在硬唯一索引 uk_sys_mfa_binding_no；
     * 若采用逻辑删除，被删除行仍占用该编码，导致同一编码再次登记时触发唯一约束冲突。
     * 因此删除语义为「释放编码」，这里执行物理删除以保持与唯一索引一致。
     */
    @Delete("DELETE FROM sys_mfa_binding WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
