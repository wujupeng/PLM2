package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysReportDataset;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SysReportDatasetMapper extends BaseMapper<SysReportDataset> {

    /**
     * 物理删除数据集。
     * <p>
     * 数据集编码支持人工指定，且表上存在硬唯一索引 uk_sys_report_dataset_code；
     * 若采用逻辑删除，被删除行仍占用该编码，导致同一编码再次登记时触发唯一约束冲突。
     * 因此删除语义为「释放编码」，这里执行物理删除以保持与唯一索引一致。
     */
    @Delete("DELETE FROM sys_report_dataset WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
