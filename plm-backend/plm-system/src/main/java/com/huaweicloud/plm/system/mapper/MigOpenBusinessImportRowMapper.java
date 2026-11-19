package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.MigOpenBusinessImportRow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/** 未结业务迁移暂存行 Mapper。 */
@Mapper
public interface MigOpenBusinessImportRowMapper extends BaseMapper<MigOpenBusinessImportRow> {

    @Select("SELECT * FROM mig_open_business_import_row WHERE id = #{id} AND deleted = 0 FOR UPDATE")
    MigOpenBusinessImportRow selectForUpdate(@Param("id") Long id);

    @Select("SELECT COUNT(*) FROM mig_open_business_import_row WHERE batch_id = #{batchId} "
            + "AND row_status = #{rowStatus} AND deleted = 0")
    long countByBatchAndStatus(@Param("batchId") Long batchId, @Param("rowStatus") String rowStatus);

    @Select("SELECT COUNT(*) FROM mig_open_business_import_row WHERE batch_id = #{batchId} AND deleted = 0")
    long countByBatch(@Param("batchId") Long batchId);
}
