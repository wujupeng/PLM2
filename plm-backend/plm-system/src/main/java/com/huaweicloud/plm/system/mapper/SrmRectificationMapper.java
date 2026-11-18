package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SrmRectification;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 整改跟踪 Mapper（对应整改跟踪）。
 */
@Mapper
public interface SrmRectificationMapper extends BaseMapper<SrmRectification> {

    /**
     * 物理删除整改跟踪记录。
     * <p>
     * 整改单号支持人工指定，且表上存在硬唯一索引；若采用逻辑删除，被删除行仍占用该编号，
     * 导致同一编号再次登记时触发唯一约束冲突。因此删除语义为「释放编码」，
     * 这里执行物理删除以保持与硬唯一索引一致。
     */
    @Delete("DELETE FROM srm_rectification WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
