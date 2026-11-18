package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.ErpProcessResource;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 资源资料 Mapper（对应 G3-N7b ERP 工艺资源）。
 */
@Mapper
public interface ErpProcessResourceMapper extends BaseMapper<ErpProcessResource> {

    /**
     * 物理删除资源记录。
     * <p>
     * 资源编码由用户指定，且表上存在硬唯一索引；若采用逻辑删除，被删除行仍占用该编码，
     * 导致同一编码再次登记时触发唯一约束冲突。因此删除语义为「释放编码」，
     * 这里执行物理删除以保持与硬唯一索引一致。
     */
    @Delete("DELETE FROM erp_process_resource WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
