package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysConfigMapper extends BaseMapper<SysConfig> {

    @Select("SELECT COUNT(1) FROM sys_config WHERE config_key = #{configKey} AND id <> #{excludeId}")
    long countByConfigKey(@Param("configKey") String configKey, @Param("excludeId") Long excludeId);
}
