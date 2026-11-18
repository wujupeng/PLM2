package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.CodeDictionary;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface CodeDictionaryMapper extends BaseMapper<CodeDictionary> {

    /**
     * 统计码表类型 + 取值编码占用情况（含逻辑删除记录），避免与数据库唯一索引冲突。
     */
    @Select("SELECT COUNT(1) FROM code_dictionary WHERE dict_type = #{dictType} AND dict_code = #{dictCode} AND id <> #{excludeId}")
    int countByCode(@Param("dictType") String dictType, @Param("dictCode") String dictCode, @Param("excludeId") Long excludeId);

    /**
     * 查询去重后的码表类型列表。
     */
    @Select("SELECT DISTINCT dict_type FROM code_dictionary WHERE deleted = 0 ORDER BY dict_type")
    List<String> listTypes();
}
