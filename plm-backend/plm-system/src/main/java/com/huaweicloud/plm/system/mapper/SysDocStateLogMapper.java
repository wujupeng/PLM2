package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysDocStateLog;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysDocStateLogMapper extends BaseMapper<SysDocStateLog> {

    /**
     * 物理删除单据状态流转日志。
     * <p>
     * 表上存在硬唯一索引 uk_sys_doc_state_log_no（log_no）；
     * 若采用逻辑删除，被删除行仍占用该编号，导致同一日志编号再次写入时触发唯一约束冲突。
     * 因此删除语义为「释放编码」，这里执行物理删除以保持与唯一索引一致。
     */
    @Delete("DELETE FROM sys_doc_state_log WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);

    /** 统计涉及的单据类型去重数。 */
    @Select("SELECT COUNT(DISTINCT doc_type) FROM sys_doc_state_log WHERE deleted = 0")
    Long countDistinctDocType();
}
