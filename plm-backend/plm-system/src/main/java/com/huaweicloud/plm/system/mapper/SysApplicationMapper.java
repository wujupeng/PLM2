package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysApplication;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysApplicationMapper extends BaseMapper<SysApplication> {

    @Select("SELECT COUNT(1) FROM sys_application WHERE app_code = #{appCode} AND id <> #{excludeId}")
    long countByCode(@Param("appCode") String appCode, @Param("excludeId") Long excludeId);
}
