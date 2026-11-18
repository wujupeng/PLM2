package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.MdMaterialCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface MdMaterialCategoryMapper extends BaseMapper<MdMaterialCategory> {

    /**
     * 统计分类编码占用情况（含逻辑删除记录），避免与数据库唯一索引冲突。
     */
    @Select("SELECT COUNT(1) FROM md_material_category WHERE category_code = #{categoryCode} AND id <> #{excludeId}")
    long countByCode(@Param("categoryCode") String categoryCode, @Param("excludeId") Long excludeId);

    /**
     * 统计指定分类下的子分类数量，用于删除前置校验。
     */
    @Select("SELECT COUNT(1) FROM md_material_category WHERE parent_id = #{parentId}")
    long countByParent(@Param("parentId") Long parentId);
}
