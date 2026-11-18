package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysDelegation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysDelegationMapper extends BaseMapper<SysDelegation> {

    @Select("SELECT COUNT(1) FROM sys_delegation WHERE delegation_no = #{delegationNo} AND id <> #{excludeId}")
    long countByNo(@Param("delegationNo") String delegationNo, @Param("excludeId") Long excludeId);
}
