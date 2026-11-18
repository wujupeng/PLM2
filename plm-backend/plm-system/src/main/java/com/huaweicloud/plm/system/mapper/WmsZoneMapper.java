package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.WmsZone;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 库区 Mapper（对应库区）。
 */
@Mapper
public interface WmsZoneMapper extends BaseMapper<WmsZone> {

    /**
     * 物理删除库区记录。
     * <p>
     * 库区编码支持人工指定，且表上存在硬唯一索引；若采用逻辑删除，被删除行仍占用该编号，
     * 导致同一编号再次登记时触发唯一约束冲突。因此删除语义为「释放编码」，
     * 这里执行物理删除以保持与硬唯一索引一致。
     */
    @Delete("DELETE FROM wms_zone WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
