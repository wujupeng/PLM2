package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysMdmCodeStandard;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SysMdmCodeStandardMapper extends BaseMapper<SysMdmCodeStandard> {

    /**
     * 物理删除编码标准。
     * <p>
     * 编码标准编号/编码支持人工指定，且表上存在硬唯一索引 uk_sys_mdm_code_standard_no、
     * uk_sys_mdm_code_standard_code；若采用逻辑删除，被删除行仍占用该编号/编码，
     * 导致同一编号/编码再次登记时触发唯一约束冲突。
     * 因此删除语义为「释放编码」，这里执行物理删除以保持与唯一索引一致。
     */
    @Delete("DELETE FROM sys_mdm_code_standard WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
