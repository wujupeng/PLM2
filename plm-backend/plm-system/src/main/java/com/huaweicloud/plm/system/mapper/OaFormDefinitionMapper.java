package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.OaFormDefinition;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface OaFormDefinitionMapper extends BaseMapper<OaFormDefinition> {

    @Select("SELECT COUNT(1) FROM oa_form_definition WHERE form_code = #{formCode} AND id <> #{excludeId}")
    long countByCode(@Param("formCode") String formCode, @Param("excludeId") Long excludeId);
}
