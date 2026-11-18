package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsInventoryTxnQuery;
import com.huaweicloud.plm.system.entity.WmsInventoryTxn;
import com.huaweicloud.plm.system.mapper.WmsInventoryTxnMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 库存流水查询服务（N7，DEV-081），供 /wms/inventory-txns 使用。
 */
@Service
@RequiredArgsConstructor
public class WmsInventoryTxnService {

    private final WmsInventoryTxnMapper wmsInventoryTxnMapper;

    public PageResult<WmsInventoryTxn> page(WmsInventoryTxnQuery query) {
        Page<WmsInventoryTxn> page = query.toPage();
        wmsInventoryTxnMapper.selectPage(page, Wrappers.<WmsInventoryTxn>lambdaQuery()
                .eq(StringUtils.hasText(query.getTxnType()), WmsInventoryTxn::getTxnType, query.getTxnType())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsInventoryTxn::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getBatchNo()), WmsInventoryTxn::getBatchNo, query.getBatchNo())
                .eq(StringUtils.hasText(query.getLineCode()), WmsInventoryTxn::getLineCode, query.getLineCode())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), WmsInventoryTxn::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getRefNo()), WmsInventoryTxn::getRefNo, query.getRefNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsInventoryTxn::getTxnNo, query.getKeyword()).or()
                        .like(WmsInventoryTxn::getMaterialCode, query.getKeyword()))
                .orderByDesc(WmsInventoryTxn::getId));
        return PageResult.of(page);
    }
}
