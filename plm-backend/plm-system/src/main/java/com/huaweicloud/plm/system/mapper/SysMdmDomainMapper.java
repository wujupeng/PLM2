package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysMdmDomain;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SysMdmDomainMapper extends BaseMapper<SysMdmDomain> {

    /**
     * 物理删除主数据域。
     * <p>
     * 主数据域编号/编码支持人工指定，且表上存在硬唯一索引 uk_sys_mdm_domain_no、uk_sys_mdm_domain_code；
     * 若采用逻辑删除，被删除行仍占用该编号/编码，导致同一编号/编码再次登记时触发唯一约束冲突。
     * 因此删除语义为「释放编码」，这里执行物理删除以保持与唯一索引一致。
     */
    @Delete("DELETE FROM sys_mdm_domain WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
