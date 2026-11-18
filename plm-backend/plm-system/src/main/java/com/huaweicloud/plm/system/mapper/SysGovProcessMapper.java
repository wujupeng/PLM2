package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysGovProcess;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SysGovProcessMapper extends BaseMapper<SysGovProcess> {

    /**
     * 物理删除端到端流程。
     * <p>
     * 流程编号/流程编码支持人工指定，且表上存在硬唯一索引 uk_sys_gov_process_no、
     * uk_sys_gov_process_code；若采用逻辑删除，被删除行仍占用该编号，导致再次登记时
     * 触发唯一约束冲突。因此删除语义为「释放编号」，这里执行物理删除以保持与唯一索引一致。
     */
    @Delete("DELETE FROM sys_gov_process WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
