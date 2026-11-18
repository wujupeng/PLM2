package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysMdmSyncLog;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SysMdmSyncLogMapper extends BaseMapper<SysMdmSyncLog> {

    /**
     * 物理删除同步日志。
     * <p>
     * 同步日志编号支持人工指定，且表上存在硬唯一索引 uk_sys_mdm_sync_log_no；
     * 若采用逻辑删除，被删除行仍占用该编号，导致统一编号再次登记时触发唯一约束冲突。
     * 因此删除语义为「释放编号」，这里执行物理删除以保持与唯一索引一致。
     */
    @Delete("DELETE FROM sys_mdm_sync_log WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
