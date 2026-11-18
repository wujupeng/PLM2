package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysSsoClient;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysSsoClientMapper extends BaseMapper<SysSsoClient> {

    @Select("SELECT COUNT(1) FROM sys_sso_client WHERE client_id = #{clientId} AND id <> #{excludeId}")
    long countByClientId(@Param("clientId") String clientId, @Param("excludeId") Long excludeId);
}
