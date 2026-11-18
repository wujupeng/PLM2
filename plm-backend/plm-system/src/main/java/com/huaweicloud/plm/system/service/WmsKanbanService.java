package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.WmsKanbanPullRequest;
import com.huaweicloud.plm.system.dto.WmsKanbanQuery;
import com.huaweicloud.plm.system.dto.WmsKanbanSaveRequest;
import com.huaweicloud.plm.system.entity.WmsDeliveryTask;
import com.huaweicloud.plm.system.entity.WmsKanban;
import com.huaweicloud.plm.system.mapper.WmsKanbanMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * 电子看板 Kanban 服务（N7，DEV-076）：看板维护与拉动补货。
 */
@Service
@RequiredArgsConstructor
public class WmsKanbanService {

    private static final String DEFAULT_KANBAN_TYPE = "PRODUCTION";
    private static final String DEFAULT_KANBAN_STATUS = "FULL";
    private static final String STATUS_ENABLED = "enabled";
    private static final String STATUS_EMPTY = "EMPTY";
    private static final String STATUS_REPLENISHING = "REPLENISHING";

    private final WmsKanbanMapper wmsKanbanMapper;
    private final WmsDeliveryService wmsDeliveryService;
    private final WmsSupportService wmsSupportService;

    public PageResult<WmsKanban> page(WmsKanbanQuery query) {
        Page<WmsKanban> page = query.toPage();
        wmsKanbanMapper.selectPage(page, Wrappers.<WmsKanban>lambdaQuery()
                .eq(StringUtils.hasText(query.getKanbanType()), WmsKanban::getKanbanType, query.getKanbanType())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsKanban::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getLineCode()), WmsKanban::getLineCode, query.getLineCode())
                .eq(StringUtils.hasText(query.getKanbanStatus()), WmsKanban::getKanbanStatus, query.getKanbanStatus())
                .eq(StringUtils.hasText(query.getStatus()), WmsKanban::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsKanban::getKanbanNo, query.getKeyword()).or()
                        .like(WmsKanban::getMaterialCode, query.getKeyword()).or()
                        .like(WmsKanban::getMaterialName, query.getKeyword()))
                .orderByDesc(WmsKanban::getId));
        return PageResult.of(page);
    }

    public WmsKanban requireKanban(String kanbanNo) {
        WmsKanban kanban = wmsKanbanMapper.selectOne(Wrappers.<WmsKanban>lambdaQuery()
                .eq(WmsKanban::getKanbanNo, kanbanNo));
        if (kanban == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "看板不存在: " + kanbanNo);
        }
        return kanban;
    }

    public WmsKanban requireById(Long id) {
        WmsKanban kanban = wmsKanbanMapper.selectById(id);
        if (kanban == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "看板不存在: " + id);
        }
        return kanban;
    }

    public Long create(WmsKanbanSaveRequest request) {
        WmsKanban kanban = new WmsKanban();
        kanban.setKanbanNo(StringUtils.hasText(request.getKanbanNo())
                ? request.getKanbanNo() : wmsSupportService.nextNo("KB"));
        applyFields(kanban, request);
        wmsKanbanMapper.insert(kanban);
        return kanban.getId();
    }

    public void update(String kanbanNo, WmsKanbanSaveRequest request) {
        WmsKanban kanban = requireKanban(kanbanNo);
        applyFields(kanban, request);
        wmsKanbanMapper.updateById(kanban);
    }

    public void delete(String kanbanNo) {
        WmsKanban kanban = requireKanban(kanbanNo);
        wmsKanbanMapper.deleteById(kanban.getId());
    }

    /**
     * 看板拉动：达到补货条件时生成配送任务并把看板置为补货中。
     */
    @Transactional(rollbackFor = Exception.class)
    public WmsDeliveryTask pull(String kanbanNo, WmsKanbanPullRequest request) {
        WmsKanban kanban = requireKanban(kanbanNo);
        if (!needReplenish(kanban)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "看板未达补货点，无需拉动");
        }
        kanban.setKanbanStatus(STATUS_REPLENISHING);
        wmsKanbanMapper.updateById(kanban);

        BigDecimal qty = request.getQty();
        if (qty == null) {
            BigDecimal max = kanban.getMaxQty() == null ? BigDecimal.ZERO : kanban.getMaxQty();
            BigDecimal current = kanban.getCurrentQty() == null ? BigDecimal.ZERO : kanban.getCurrentQty();
            qty = max.subtract(current);
            if (qty.compareTo(BigDecimal.ZERO) <= 0) {
                qty = kanban.getContainerQty() == null ? BigDecimal.ZERO : kanban.getContainerQty();
            }
            if (qty.compareTo(BigDecimal.ZERO) <= 0) {
                qty = kanban.getReplenishPoint() == null ? BigDecimal.ZERO : kanban.getReplenishPoint();
            }
        }
        return wmsDeliveryService.createFromKanban(kanban, qty);
    }

    private boolean needReplenish(WmsKanban kanban) {
        if (STATUS_EMPTY.equals(kanban.getKanbanStatus())) {
            return true;
        }
        BigDecimal current = kanban.getCurrentQty();
        BigDecimal point = kanban.getReplenishPoint();
        return current != null && point != null && current.compareTo(point) <= 0;
    }

    private void applyFields(WmsKanban kanban, WmsKanbanSaveRequest request) {
        kanban.setKanbanType(StringUtils.hasText(request.getKanbanType())
                ? request.getKanbanType() : DEFAULT_KANBAN_TYPE);
        kanban.setMaterialCode(request.getMaterialCode());
        kanban.setMaterialName(request.getMaterialName());
        kanban.setFromLocationCode(request.getFromLocationCode());
        kanban.setLineCode(request.getLineCode());
        kanban.setWorkStation(request.getWorkStation());
        kanban.setContainerQty(zeroIfNull(request.getContainerQty()));
        kanban.setReplenishPoint(zeroIfNull(request.getReplenishPoint()));
        kanban.setMinQty(zeroIfNull(request.getMinQty()));
        kanban.setMaxQty(zeroIfNull(request.getMaxQty()));
        kanban.setCurrentQty(zeroIfNull(request.getCurrentQty()));
        kanban.setKanbanStatus(StringUtils.hasText(request.getKanbanStatus())
                ? request.getKanbanStatus() : DEFAULT_KANBAN_STATUS);
        kanban.setPullSignal(request.getPullSignal());
        kanban.setSupplierCode(request.getSupplierCode());
        kanban.setLeadTimeDays(request.getLeadTimeDays());
        kanban.setStatus(StringUtils.hasText(request.getStatus())
                ? request.getStatus() : STATUS_ENABLED);
        kanban.setRemark(request.getRemark());
    }

    private BigDecimal zeroIfNull(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
