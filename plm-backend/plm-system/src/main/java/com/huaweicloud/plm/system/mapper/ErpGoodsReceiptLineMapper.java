package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.ErpGoodsReceiptLine;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 采购到货单行 Mapper（G3-N3a ERP 采购管理）。
 */
@Mapper
public interface ErpGoodsReceiptLineMapper extends BaseMapper<ErpGoodsReceiptLine> {

    /**
     * 查询指定采购到货单下当前最大行号，用于新增行时自动取号。
     */
    @Select("SELECT MAX(line_no) FROM erp_goods_receipt_line WHERE receipt_id = #{receiptId} AND deleted = 0")
    Integer selectMaxLineNo(@Param("receiptId") Long receiptId);
}
