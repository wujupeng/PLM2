package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IntDeliveryItemQuery;
import com.huaweicloud.plm.system.dto.IntDeliveryItemSaveRequest;
import com.huaweicloud.plm.system.entity.IntDeliveryItem;
import com.huaweicloud.plm.system.mapper.IntDeliveryItemMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/** 交付物服务（N9，DEV-105）。 */
@Service
@RequiredArgsConstructor
public class IntDeliveryItemService {

    private static final String DEFAULT_STATUS = "PENDING";
    private static final String STATUS_ACCEPTED = "ACCEPTED";
    private static final String NO_PREFIX = "DLV";

    private final IntDeliveryItemMapper intDeliveryItemMapper;
    private final IntSupportService intSupport;

    /** 分页查询交付物。 */
    public PageResult<IntDeliveryItem> page(IntDeliveryItemQuery query) {
        Page<IntDeliveryItem> page = query.toPage();
        intDeliveryItemMapper.selectPage(page, Wrappers.<IntDeliveryItem>lambdaQuery()
                .eq(StringUtils.hasText(query.getItemNo()), IntDeliveryItem::getItemNo, query.getItemNo())
                .eq(StringUtils.hasText(query.getCategory()), IntDeliveryItem::getCategory, query.getCategory())
                .eq(StringUtils.hasText(query.getStatus()), IntDeliveryItem::getStatus, query.getStatus())
                .eq(StringUtils.hasText(query.getName()), IntDeliveryItem::getName, query.getName())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(IntDeliveryItem::getItemNo, query.getKeyword()).or()
                        .like(IntDeliveryItem::getName, query.getKeyword()).or()
                        .like(IntDeliveryItem::getFilePath, query.getKeyword()))
                .orderByDesc(IntDeliveryItem::getId));
        return PageResult.of(page);
    }

    /** 按编号获取交付物，不存在则抛出业务异常。 */
    public IntDeliveryItem require(String itemNo) {
        IntDeliveryItem item = intDeliveryItemMapper.selectOne(Wrappers.<IntDeliveryItem>lambdaQuery()
                .eq(IntDeliveryItem::getItemNo, itemNo)
                .last("LIMIT 1"));
        if (item == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "交付物不存在: " + itemNo);
        }
        return item;
    }

    /** 创建交付物，返回交付物编号。 */
    public String create(IntDeliveryItemSaveRequest request) {
        IntDeliveryItem item = new IntDeliveryItem();
        item.setItemNo(StringUtils.hasText(request.getItemNo())
                ? request.getItemNo() : intSupport.nextNo(NO_PREFIX));
        item.setCategory(request.getCategory());
        item.setName(request.getName());
        item.setItemVersion(request.getVersion());
        item.setFilePath(request.getFilePath());
        item.setChecksum(request.getChecksum());
        item.setStatus(DEFAULT_STATUS);
        item.setRemark(request.getRemark());
        intDeliveryItemMapper.insert(item);
        return item.getItemNo();
    }

    /** 更新交付物。 */
    public void update(String itemNo, IntDeliveryItemSaveRequest request) {
        IntDeliveryItem item = require(itemNo);
        if (StringUtils.hasText(request.getItemNo())) {
            item.setItemNo(request.getItemNo());
        }
        item.setCategory(request.getCategory());
        item.setName(request.getName());
        item.setItemVersion(request.getVersion());
        item.setFilePath(request.getFilePath());
        item.setChecksum(request.getChecksum());
        item.setRemark(request.getRemark());
        intDeliveryItemMapper.updateById(item);
    }

    /** 删除交付物。 */
    public void delete(String itemNo) {
        IntDeliveryItem item = require(itemNo);
        intDeliveryItemMapper.deleteById(item.getId());
    }

    /** 验收交付物，返回更新后的实体。 */
    public IntDeliveryItem verify(String itemNo) {
        IntDeliveryItem item = require(itemNo);
        item.setStatus(STATUS_ACCEPTED);
        item.setVerifier(UserContext.getUsername());
        if (item.getDeliveredAt() == null) {
            item.setDeliveredAt(LocalDateTime.now());
        }
        intDeliveryItemMapper.updateById(item);
        return item;
    }
}
