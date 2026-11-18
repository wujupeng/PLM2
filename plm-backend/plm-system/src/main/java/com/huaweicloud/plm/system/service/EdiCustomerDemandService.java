package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.EdiCustomerDemandQuery;
import com.huaweicloud.plm.system.dto.EdiDemandDispatchRequest;
import com.huaweicloud.plm.system.entity.EdiCustomerDemand;
import com.huaweicloud.plm.system.entity.EdiDemandChangeLog;
import com.huaweicloud.plm.system.entity.EdiDemandDispatch;
import com.huaweicloud.plm.system.entity.EdiRawMessage;
import com.huaweicloud.plm.system.mapper.EdiCustomerDemandMapper;
import com.huaweicloud.plm.system.mapper.EdiDemandChangeLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * 客户需求服务（N6，DEV-066/067/069）：把解析后的标准字段落库为客户需求并留痕变更，支持向供应商分发。
 */
@Service
@RequiredArgsConstructor
public class EdiCustomerDemandService {

    private static final String STATUS_NEW = "NEW";
    private static final String STATUS_CHANGED = "CHANGED";
    private static final String STATUS_CLOSED = "CLOSED";
    private static final String CHANGE_NEW = "NEW";
    private static final String CHANGE_CHANGE = "CHANGE";
    private static final String CHANGE_CANCEL = "CANCEL";
    private static final String DEFAULT_LINE_NO = "1";
    private static final String DEFAULT_DEMAND_PATTERN = "CD-{yyyyMM}-{4 位流水号}";
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyyMM");
    private static final int MAX_SEQUENCE_TRIES = 1000;

    private final EdiCustomerDemandMapper ediCustomerDemandMapper;
    private final EdiDemandChangeLogMapper ediDemandChangeLogMapper;
    private final EdiMessageParser ediMessageParser;
    private final EdiDispatchService ediDispatchService;
    private final EdiSupportService ediSupport;

    public PageResult<EdiCustomerDemand> page(EdiCustomerDemandQuery query) {
        Page<EdiCustomerDemand> page = query.toPage();
        ediCustomerDemandMapper.selectPage(page, Wrappers.<EdiCustomerDemand>lambdaQuery()
                .eq(StringUtils.hasText(query.getPartnerCode()), EdiCustomerDemand::getPartnerCode, query.getPartnerCode())
                .eq(StringUtils.hasText(query.getCustomerCode()), EdiCustomerDemand::getCustomerCode, query.getCustomerCode())
                .eq(StringUtils.hasText(query.getTransCode()), EdiCustomerDemand::getTransCode, query.getTransCode())
                .eq(StringUtils.hasText(query.getDocType()), EdiCustomerDemand::getDocType, query.getDocType())
                .eq(StringUtils.hasText(query.getStatus()), EdiCustomerDemand::getStatus, query.getStatus())
                .eq(StringUtils.hasText(query.getMaterialCode()), EdiCustomerDemand::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getCustomerOrderNo()), EdiCustomerDemand::getCustomerOrderNo, query.getCustomerOrderNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(EdiCustomerDemand::getDemandNo, query.getKeyword()).or()
                        .like(EdiCustomerDemand::getCustomerOrderNo, query.getKeyword()).or()
                        .like(EdiCustomerDemand::getMaterialCode, query.getKeyword()))
                .orderByDesc(EdiCustomerDemand::getId));
        return PageResult.of(page);
    }

    public EdiCustomerDemand requireDemand(String demandNo) {
        EdiCustomerDemand demand = ediCustomerDemandMapper.selectOne(Wrappers.<EdiCustomerDemand>lambdaQuery()
                .eq(EdiCustomerDemand::getDemandNo, demandNo));
        if (demand == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "客户需求不存在: " + demandNo);
        }
        return demand;
    }

    public EdiCustomerDemand detail(String demandNo) {
        return requireDemand(demandNo);
    }

    public List<EdiDemandChangeLog> listChanges(String demandNo) {
        EdiCustomerDemand demand = requireDemand(demandNo);
        return ediDemandChangeLogMapper.selectList(Wrappers.<EdiDemandChangeLog>lambdaQuery()
                .eq(EdiDemandChangeLog::getDemandId, demand.getId())
                .orderByDesc(EdiDemandChangeLog::getId));
    }

    /**
     * 需求向供应商分发（DEV-070），复用分发服务并在无指定参数时按物料全部供货关系拆分。
     */
    public List<EdiDemandDispatch> dispatch(String demandNo, EdiDemandDispatchRequest request) {
        requireDemand(demandNo);
        request.setDemandNo(demandNo);
        return ediDispatchService.dispatch(request);
    }

    /**
     * 把解析结果落库为客户需求：逐行生成/比对，产生变更留痕。
     */
    @Transactional(rollbackFor = Exception.class)
    public List<EdiCustomerDemand> ingest(EdiRawMessage message, EdiMessageParser.ParseResult parsed) {
        List<Map<String, String>> lineMaps = parsed.lines().isEmpty() ? List.of(Map.of()) : parsed.lines();
        List<EdiCustomerDemand> result = new ArrayList<>(lineMaps.size());
        for (Map<String, String> lineMap : lineMaps) {
            Map<String, String> merged = new LinkedHashMap<>(parsed.header());
            merged.putAll(lineMap);
            result.add(upsert(message, merged));
        }
        return result;
    }

    private EdiCustomerDemand upsert(EdiRawMessage message, Map<String, String> merged) {
        String customerOrderNo = StringUtils.hasText(merged.get("customerOrderNo"))
                ? merged.get("customerOrderNo") : message.getMessageNo();
        String customerLineNo = StringUtils.hasText(merged.get("customerLineNo"))
                ? merged.get("customerLineNo") : DEFAULT_LINE_NO;
        BigDecimal qty = toDecimal(merged.get("qty"));
        LocalDate requiredDate = toDate(merged.get("requiredDate"));

        EdiCustomerDemand existing = findExisting(message.getPartnerCode(), customerOrderNo, customerLineNo);
        EdiCustomerDemand demand = existing == null ? new EdiCustomerDemand() : existing;
        String changeType;
        if (existing == null) {
            demand.setDemandNo(nextDemandNo());
            changeType = CHANGE_NEW;
        } else {
            int prevVersion = existing.getDemandVersion() == null ? 1 : existing.getDemandVersion();
            boolean qtyChanged = !equalsDecimal(existing.getQty(), qty);
            boolean dateChanged = !Objects.equals(existing.getRequiredDate(), requiredDate);
            if (!qtyChanged && !dateChanged) {
                return existing;
            }
            demand.setPrevQty(existing.getQty());
            demand.setPrevRequiredDate(existing.getRequiredDate());
            changeType = qty != null && qty.compareTo(BigDecimal.ZERO) == 0 ? CHANGE_CANCEL : CHANGE_CHANGE;
        }

        demand.setMessageNo(message.getMessageNo());
        demand.setPartnerCode(message.getPartnerCode());
        demand.setTransCode(message.getTransCode());
        demand.setCustomerOrderNo(customerOrderNo);
        demand.setCustomerLineNo(customerLineNo);
        demand.setQty(qty);
        demand.setRequiredDate(requiredDate);
        demand.setDocType(inferDocType(message.getTransCode()));
        demand.setStatus(CHANGE_NEW.equals(changeType) ? STATUS_NEW : STATUS_CHANGED);
        demand.setChangeType(changeType);
        applyField(demand, "customerCode", merged.get("customerCode"));
        applyField(demand, "materialCode", merged.get("materialCode"));
        applyField(demand, "productCode", merged.get("productCode"));
        applyField(demand, "unit", merged.get("unit"));
        applyField(demand, "shipTo", merged.get("shipTo"));
        applyField(demand, "plantCode", merged.get("plantCode"));
        applyField(demand, "changeReason", merged.get("changeReason"));

        if (existing == null) {
            demand.setDemandVersion(1);
            ediCustomerDemandMapper.insert(demand);
        } else {
            demand.setDemandVersion((existing.getDemandVersion() == null ? 1 : existing.getDemandVersion()) + 1);
            ediCustomerDemandMapper.updateById(demand);
            writeChangeLog(demand, message);
        }
        return demand;
    }

    private void writeChangeLog(EdiCustomerDemand demand, EdiRawMessage message) {
        EdiDemandChangeLog changeLog = new EdiDemandChangeLog();
        changeLog.setDemandId(demand.getId());
        changeLog.setDemandNo(demand.getDemandNo());
        changeLog.setChangeType(demand.getChangeType());
        changeLog.setPrevQty(demand.getPrevQty());
        changeLog.setNewQty(demand.getQty());
        changeLog.setPrevDate(demand.getPrevRequiredDate());
        changeLog.setNewDate(demand.getRequiredDate());
        changeLog.setPrevVersion(demand.getDemandVersion() == null ? null : demand.getDemandVersion() - 1);
        changeLog.setNewVersion(demand.getDemandVersion());
        changeLog.setMessageNo(message.getMessageNo());
        changeLog.setChangeReason(demand.getChangeReason());
        changeLog.setOperatorName(message.getMessageNo());
        changeLog.setChangedAt(LocalDateTime.now());
        ediDemandChangeLogMapper.insert(changeLog);
    }

    private EdiCustomerDemand findExisting(String partnerCode, String customerOrderNo, String customerLineNo) {
        List<EdiCustomerDemand> list = ediCustomerDemandMapper.selectList(Wrappers.<EdiCustomerDemand>lambdaQuery()
                .eq(EdiCustomerDemand::getPartnerCode, partnerCode)
                .eq(EdiCustomerDemand::getCustomerOrderNo, customerOrderNo)
                .eq(EdiCustomerDemand::getCustomerLineNo, customerLineNo)
                .ne(EdiCustomerDemand::getStatus, STATUS_CLOSED)
                .orderByDesc(EdiCustomerDemand::getDemandVersion)
                .orderByDesc(EdiCustomerDemand::getId));
        return list.isEmpty() ? null : list.get(0);
    }

    /**
     * 按配置的需求单号规则生成编号；未明确的编号规则统一通过配置项 {@code edi.demand.number.pattern} 调整。
     */
    private String nextDemandNo() {
        String pattern = ediSupport.config("edi.demand.number.pattern", DEFAULT_DEMAND_PATTERN);
        String timestamp = LocalDate.now().format(MONTH_FORMATTER);
        String probe = ediMessageParser.formatSequenceNo(pattern, DEFAULT_DEMAND_PATTERN, timestamp, 1);
        String prefix = probe.replaceAll("\\d+$", "");
        long used = StringUtils.hasText(prefix)
                ? ediCustomerDemandMapper.selectCount(Wrappers.<EdiCustomerDemand>lambdaQuery()
                        .likeRight(EdiCustomerDemand::getDemandNo, prefix))
                : 0L;
        for (int i = 0; i < MAX_SEQUENCE_TRIES; i++) {
            String candidate = ediMessageParser.formatSequenceNo(pattern, DEFAULT_DEMAND_PATTERN, timestamp, used + 1 + i);
            long exists = ediCustomerDemandMapper.selectCount(Wrappers.<EdiCustomerDemand>lambdaQuery()
                    .eq(EdiCustomerDemand::getDemandNo, candidate));
            if (exists == 0) {
                return candidate;
            }
        }
        return ediSupport.nextNo("CD");
    }

    private String inferDocType(String transCode) {
        if ("830".equals(transCode)) {
            return "FORECAST";
        }
        return "ORDER";
    }

    private void applyField(EdiCustomerDemand demand, String field, String value) {
        switch (field) {
            case "customerCode" -> demand.setCustomerCode(value);
            case "materialCode" -> demand.setMaterialCode(value);
            case "productCode" -> demand.setProductCode(value);
            case "unit" -> demand.setUnit(value);
            case "shipTo" -> demand.setShipTo(value);
            case "plantCode" -> demand.setPlantCode(value);
            case "changeReason" -> demand.setChangeReason(value);
            default -> {
                // 其余字段由解析结果按需扩展
            }
        }
    }

    private BigDecimal toDecimal(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return new BigDecimal(value.trim());
        } catch (NumberFormatException e) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "数量格式不正确: " + value);
        }
    }

    private LocalDate toDate(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return LocalDate.parse(value.trim());
        } catch (Exception e) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "需求日期格式不正确: " + value);
        }
    }

    private boolean equalsDecimal(BigDecimal left, BigDecimal right) {
        if (left == null || right == null) {
            return left == right;
        }
        return left.compareTo(right) == 0;
    }
}
