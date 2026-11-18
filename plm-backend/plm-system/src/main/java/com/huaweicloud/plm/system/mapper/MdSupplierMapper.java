package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.MdSupplier;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface MdSupplierMapper extends BaseMapper<MdSupplier> {

    /**
     * 统计供应商编码占用情况（含逻辑删除记录），避免与数据库唯一索引冲突。
     */
    @Select("SELECT COUNT(1) FROM md_supplier WHERE supplier_code = #{supplierCode} AND id <> #{excludeId}")
    long countByCode(@Param("supplierCode") String supplierCode, @Param("excludeId") Long excludeId);
}
