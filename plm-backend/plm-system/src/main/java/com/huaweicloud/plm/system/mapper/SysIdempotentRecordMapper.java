package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysIdempotentRecord;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SysIdempotentRecordMapper extends BaseMapper<SysIdempotentRecord> {

    /**
     * 物理删除幂等记录。
     * <p>
     * 幂等键为下游调用方传入的业务唯一键，且表上存在硬唯一索引 uk_sys_idempotent_record_key；
     * 若采用逻辑删除，被删除行仍占用该键，导致同一幂等键再次登记时触发唯一约束冲突。
     * 因此删除语义为「释放幂等键」，这里执行物理删除以保持与唯一索引一致。
     */
    @Delete("DELETE FROM sys_idempotent_record WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
