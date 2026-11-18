package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.ErpFinanceVoucher;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 记账凭证头 Mapper（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）。
 */
@Mapper
public interface ErpFinanceVoucherMapper extends BaseMapper<ErpFinanceVoucher> {

    /**
     * 物理删除记账凭证头。
     * <p>
     * 凭证号支持人工指定，且表上存在硬唯一索引；若采用逻辑删除，被删除行仍占用该凭证号，
     * 导致同一凭证号再次登记时触发唯一约束冲突。因此删除语义为「释放凭证号」，
     * 这里执行物理删除以保持与硬唯一索引一致。
     */
    @Delete("DELETE FROM erp_finance_voucher WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
