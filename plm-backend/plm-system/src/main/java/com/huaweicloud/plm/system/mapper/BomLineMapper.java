package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.BomLine;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface BomLineMapper extends BaseMapper<BomLine> {

    /**
     * 查询指定 BOM 头下当前最大行号，用于新增行时自动取号。
     */
    @Select("SELECT MAX(line_no) FROM bom_line WHERE header_id = #{headerId} AND deleted = 0")
    Integer selectMaxLineNo(@Param("headerId") Long headerId);
}
