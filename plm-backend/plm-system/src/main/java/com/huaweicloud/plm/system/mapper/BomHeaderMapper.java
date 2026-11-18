package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.BomHeader;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface BomHeaderMapper extends BaseMapper<BomHeader> {

    /**
     * 统计 产品编码+BOM 类型+版本号 占用情况（含逻辑删除记录），避免与数据库唯一索引冲突。
     */
    @Select("SELECT COUNT(1) FROM bom_header WHERE product_code = #{productCode} AND bom_type = #{bomType} "
            + "AND version_no = #{versionNo} AND id <> #{excludeId}")
    long countByUnique(@Param("productCode") String productCode, @Param("bomType") String bomType,
                       @Param("versionNo") String versionNo, @Param("excludeId") Long excludeId);
}
