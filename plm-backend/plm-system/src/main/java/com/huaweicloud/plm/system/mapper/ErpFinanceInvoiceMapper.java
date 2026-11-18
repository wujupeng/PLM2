package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.ErpFinanceInvoice;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 发票登记 Mapper（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）。
 */
@Mapper
public interface ErpFinanceInvoiceMapper extends BaseMapper<ErpFinanceInvoice> {

    /**
     * 物理删除发票登记。
     * <p>
     * 发票号码由用户提供，是唯一业务键，且表上存在硬唯一索引；若采用逻辑删除，被删除行仍占用该票号，
     * 导致同一票号再次登记时触发唯一约束冲突。因此删除语义为「释放编码」，
     * 这里执行物理删除以保持与硬唯一索引一致。
     */
    @Delete("DELETE FROM erp_finance_invoice WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
