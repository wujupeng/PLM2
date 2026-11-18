package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysRole;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysRoleMapper extends BaseMapper<SysRole> {

    @Select("SELECT COUNT(1) FROM sys_role WHERE role_code = #{roleCode} AND id <> #{excludeId}")
    long countByRoleCode(@Param("roleCode") String roleCode, @Param("excludeId") Long excludeId);
}
