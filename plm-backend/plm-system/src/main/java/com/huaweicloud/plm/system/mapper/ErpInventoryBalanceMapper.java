package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.ErpInventoryBalance;
import org.apache.ibatis.annotations.Mapper;

/**
 * 库存余额 Mapper（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 * 本表无单据号字段，删除采用逻辑删除（BaseMapper.deleteById）。
 */
@Mapper
public interface ErpInventoryBalanceMapper extends BaseMapper<ErpInventoryBalance> {
}
