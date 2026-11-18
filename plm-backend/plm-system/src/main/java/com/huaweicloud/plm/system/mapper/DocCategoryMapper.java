package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.DocCategory;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface DocCategoryMapper extends BaseMapper<DocCategory> {

    /**
     * 统计分类编码占用情况（含逻辑删除记录），避免与数据库唯一索引冲突。
     */
    @Select("SELECT COUNT(1) FROM doc_category WHERE category_code = #{categoryCode} AND id <> #{excludeId}")
    int countByCode(@Param("categoryCode") String categoryCode, @Param("excludeId") Long excludeId);
}
