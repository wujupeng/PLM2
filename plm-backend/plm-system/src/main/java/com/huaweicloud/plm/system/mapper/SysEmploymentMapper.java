package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysEmployment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysEmploymentMapper extends BaseMapper<SysEmployment> {

    @Select("SELECT COUNT(1) FROM sys_employment WHERE employee_no = #{employeeNo} AND id <> #{excludeId}")
    long countByNo(@Param("employeeNo") String employeeNo, @Param("excludeId") Long excludeId);
}
