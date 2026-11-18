package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysOrganization;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysOrganizationMapper extends BaseMapper<SysOrganization> {

    @Select("SELECT COUNT(1) FROM sys_organization WHERE org_code = #{orgCode} AND id <> #{excludeId}")
    long countByOrgCode(@Param("orgCode") String orgCode, @Param("excludeId") Long excludeId);
}
