package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.ErpFinancePeriod;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 会计期间 Mapper（对应 WBS T028 会计科目与会计期间，属 G3-N6 ERP 财务）。
 */
@Mapper
public interface ErpFinancePeriodMapper extends BaseMapper<ErpFinancePeriod> {

    /**
     * 物理删除会计期间。
     * <p>
     * 期间编码由用户指定，且表上存在硬唯一索引；若采用逻辑删除，被删除行仍占用该编码，
     * 导致同一期间编码再次登记时触发唯一约束冲突。因此删除语义为「释放编码」，
     * 这里执行物理删除以保持与硬唯一索引一致。
     */
    @Delete("DELETE FROM erp_finance_period WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
