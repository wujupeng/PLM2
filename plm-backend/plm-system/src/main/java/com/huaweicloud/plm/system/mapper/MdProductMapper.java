package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.MdProduct;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface MdProductMapper extends BaseMapper<MdProduct> {

    /**
     * 统计产品编码占用情况（含逻辑删除记录），避免与数据库唯一索引冲突。
     */
    @Select("SELECT COUNT(1) FROM md_product WHERE product_code = #{productCode} AND id <> #{excludeId}")
    long countByCode(@Param("productCode") String productCode, @Param("excludeId") Long excludeId);
}
