package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.MdMaterial;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface MdMaterialMapper extends BaseMapper<MdMaterial> {

    /**
     * 统计物料编码占用情况（含逻辑删除记录），避免与数据库唯一索引冲突。
     */
    @Select("SELECT COUNT(1) FROM md_material WHERE material_code = #{materialCode} AND id <> #{excludeId}")
    long countByCode(@Param("materialCode") String materialCode, @Param("excludeId") Long excludeId);
}
