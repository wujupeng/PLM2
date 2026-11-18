package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.ErpFinanceVoucherLine;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 记账凭证分录行 Mapper（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）。
 */
@Mapper
public interface ErpFinanceVoucherLineMapper extends BaseMapper<ErpFinanceVoucherLine> {

    /**
     * 查询指定记账凭证下当前最大行号，用于新增分录行时自动取号。
     */
    @Select("SELECT MAX(line_no) FROM erp_finance_voucher_line WHERE voucher_id = #{fk} AND deleted = 0")
    Integer selectMaxLineNo(@Param("fk") Long fk);
}
