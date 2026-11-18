package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.OaProcessDefinition;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface OaProcessDefinitionMapper extends BaseMapper<OaProcessDefinition> {

    @Select("SELECT COUNT(1) FROM oa_process_definition WHERE process_code = #{processCode} AND id <> #{excludeId}")
    long countByCode(@Param("processCode") String processCode, @Param("excludeId") Long excludeId);
}
