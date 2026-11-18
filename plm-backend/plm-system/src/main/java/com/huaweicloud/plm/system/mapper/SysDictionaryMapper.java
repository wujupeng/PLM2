package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysDictionary;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysDictionaryMapper extends BaseMapper<SysDictionary> {

    @Select("SELECT COUNT(1) FROM sys_dictionary WHERE dict_type = #{dictType} AND dict_value = #{dictValue} "
            + "AND id <> #{excludeId}")
    long countByTypeAndValue(@Param("dictType") String dictType, @Param("dictValue") String dictValue,
                             @Param("excludeId") Long excludeId);
}
