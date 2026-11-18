package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysPosition;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysPositionMapper extends BaseMapper<SysPosition> {

    @Select("SELECT COUNT(1) FROM sys_position WHERE position_code = #{positionCode} AND id <> #{excludeId}")
    long countByCode(@Param("positionCode") String positionCode, @Param("excludeId") Long excludeId);
}
