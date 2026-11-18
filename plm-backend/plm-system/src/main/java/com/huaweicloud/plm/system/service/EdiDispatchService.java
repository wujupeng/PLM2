package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.EdiDemandDispatchRequest;
import com.huaweicloud.plm.system.dto.EdiDispatchQuery;
import com.huaweicloud.plm.system.entity.EdiCustomerDemand;
import com.huaweicloud.plm.system.entity.EdiDemandDispatch;
import com.huaweicloud.plm.system.entity.EdiSupplierMaterial;
import com.huaweicloud.plm.system.mapper.EdiCustomerDemandMapper;
import com.huaweicloud.plm.system.mapper.EdiDemandDispatchMapper;
import com.huaweicloud.plm.system.mapper.EdiSupplierMaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 需求向供应商分发服务（N6，DEV-070）：按供货关系与分配规则拆分需求并发送。
 */
@Service
@RequiredArgsConstructor
public class EdiDispatchService {

    private static final String RULE_BY_SHARE = "BY_SUPPLIER_SHARE";
    private static final String RULE_PRIORITY = "PRIORITY";
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_SENT = "SENT";
    private static final String DEMAND_STATUS_DISPATCHED = "DISPATCHED";

    private final EdiDemandDispatchMapper ediDemandDispatchMapper;
    private final EdiCustomerDemandMapper ediCustomerDemandMapper;
    private final EdiSupplierMaterialMapper ediSupplierMaterialMapper;
    private final EdiSupportService ediSupport;

    /**
     * 将需求按供货关系分发到供应商。
     */
    @Transactional(rollbackFor = Exception.class)
    public List<EdiDemandDispatch> dispatch(EdiDemandDispatchRequest request) {
        EdiCustomerDemand demand = ediCustomerDemandMapper.selectOne(Wrappers.<EdiCustomerDemand>lambdaQuery()
                .eq(EdiCustomerDemand::getDemandNo, request.getDemandNo()));
        if (demand == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "需求不存在: " + request.getDemandNo());
        }

        List<String> supplierCodes = request.getSupplierCodes();
        List<EdiSupplierMaterial> relations = ediSupplierMaterialMapper.selectList(
                Wrappers.<EdiSupplierMaterial>lambdaQuery()
                        .eq(EdiSupplierMaterial::getMaterialCode, demand.getMaterialCode())
                        .eq(EdiSupplierMaterial::getStatus, 1)
                        .in(!CollectionUtils.isEmpty(supplierCodes), EdiSupplierMaterial::getSupplierCode, supplierCodes));
        if (CollectionUtils.isEmpty(relations)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "该物料未配置供货关系，无法分发");
        }

        String allocationRule = StringUtils.hasText(request.getAllocationRule())
                ? request.getAllocationRule()
                : ediSupport.config("edi.dispatch.allocation.strategy", RULE_BY_SHARE);
        List<BigDecimal> allocation = allocate(relations, demand.getQty(), allocationRule);

        List<EdiDemandDispatch> dispatches = new ArrayList<>(relations.size());
        for (int i = 0; i < relations.size(); i++) {
            EdiSupplierMaterial relation = relations.get(i);
            EdiDemandDispatch dispatch = new EdiDemandDispatch();
            dispatch.setDispatchNo(ediSupport.nextNo("DSP"));
            dispatch.setDemandId(demand.getId());
            dispatch.setDemandNo(demand.getDemandNo());
            dispatch.setSupplierCode(relation.getSupplierCode());
            dispatch.setSupplierName(relation.getSupplierName());
            dispatch.setMaterialCode(demand.getMaterialCode());
            dispatch.setQty(allocation.get(i));
            dispatch.setUnit(demand.getUnit());
            dispatch.setRequiredDate(demand.getRequiredDate());
            dispatch.setDemandVersion(demand.getDemandVersion());
            dispatch.setAllocationRule(allocationRule);
            dispatch.setSharePct(relation.getSharePct());
            dispatch.setSendChannel(StringUtils.hasText(relation.getSendChannel())
                    ? relation.getSendChannel() : request.getSendChannel());
            dispatch.setSendStatus(STATUS_PENDING);
            dispatch.setRetryCount(0);
            dispatch.setRemark(request.getRemark());
            ediDemandDispatchMapper.insert(dispatch);
            dispatches.add(dispatch);
        }

        demand.setStatus(DEMAND_STATUS_DISPATCHED);
        ediCustomerDemandMapper.updateById(demand);

        ediSupport.writeLog(demand.getMessageNo(), demand.getPartnerCode(), "862", "OUTBOUND", "DISPATCH",
                "SUCCESS", "需求分发至 " + dispatches.size() + " 个供应商", demand.getDemandNo());

        if (Boolean.TRUE.equals(request.getAutoSend())) {
            for (EdiDemandDispatch dispatch : dispatches) {
                send(dispatch);
            }
        }
        return dispatches;
    }

    /**
     * 发送单条分发记录给供应商。
     * 真实通道对接为占位：待业务方提供 API/SFTP/MAIL 通道条件后再补充实际报文投递逻辑。
     */
    @Transactional(rollbackFor = Exception.class)
    public void send(String dispatchNo) {
        send(requireDispatch(dispatchNo));
    }

    private void send(EdiDemandDispatch dispatch) {
        dispatch.setSendStatus(STATUS_SENT);
        dispatch.setSentAt(LocalDateTime.now());
        dispatch.setRetryCount(dispatch.getRetryCount() == null ? 1 : dispatch.getRetryCount() + 1);
        ediDemandDispatchMapper.updateById(dispatch);

        ediSupport.writeLog(dispatch.getDemandNo(), null, "862", "OUTBOUND", "SEND",
                "SUCCESS", "需求已发送给供应商", dispatch.getDispatchNo());
    }

    public PageResult<EdiDemandDispatch> page(EdiDispatchQuery query) {
        Page<EdiDemandDispatch> page = query.toPage();
        ediDemandDispatchMapper.selectPage(page, Wrappers.<EdiDemandDispatch>lambdaQuery()
                .eq(StringUtils.hasText(query.getDemandNo()), EdiDemandDispatch::getDemandNo, query.getDemandNo())
                .eq(StringUtils.hasText(query.getSupplierCode()), EdiDemandDispatch::getSupplierCode, query.getSupplierCode())
                .eq(StringUtils.hasText(query.getSendStatus()), EdiDemandDispatch::getSendStatus, query.getSendStatus())
                .eq(StringUtils.hasText(query.getDispatchNo()), EdiDemandDispatch::getDispatchNo, query.getDispatchNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(EdiDemandDispatch::getDispatchNo, query.getKeyword()).or()
                        .like(EdiDemandDispatch::getDemandNo, query.getKeyword()).or()
                        .like(EdiDemandDispatch::getMaterialCode, query.getKeyword()))
                .orderByDesc(EdiDemandDispatch::getId));
        return PageResult.of(page);
    }

    public EdiDemandDispatch requireDispatch(String dispatchNo) {
        EdiDemandDispatch dispatch = ediDemandDispatchMapper.selectOne(Wrappers.<EdiDemandDispatch>lambdaQuery()
                .eq(EdiDemandDispatch::getDispatchNo, dispatchNo));
        if (dispatch == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "分发记录不存在: " + dispatchNo);
        }
        return dispatch;
    }

    public EdiDemandDispatch detail(String dispatchNo) {
        return requireDispatch(dispatchNo);
    }

    public List<EdiDemandDispatch> listByDemand(String demandNo) {
        return ediDemandDispatchMapper.selectList(Wrappers.<EdiDemandDispatch>lambdaQuery()
                .eq(EdiDemandDispatch::getDemandNo, demandNo)
                .orderByDesc(EdiDemandDispatch::getId));
    }

    /**
     * 按分配规则计算每个供货关系应分配的数量（保留 4 位小数）。
     */
    private List<BigDecimal> allocate(List<EdiSupplierMaterial> relations, BigDecimal demandQty, String rule) {
        int size = relations.size();
        List<BigDecimal> result = new ArrayList<>(size);
        BigDecimal qty = demandQty == null ? BigDecimal.ZERO : demandQty;

        if (RULE_PRIORITY.equalsIgnoreCase(rule)) {
            int minIdx = 0;
            Integer minPriority = null;
            for (int i = 0; i < size; i++) {
                Integer priority = relations.get(i).getPriority();
                int value = priority == null ? Integer.MAX_VALUE : priority;
                if (minPriority == null || value < minPriority) {
                    minPriority = value;
                    minIdx = i;
                }
            }
            for (int i = 0; i < size; i++) {
                result.add(i == minIdx ? qty : BigDecimal.ZERO);
            }
            return result;
        }

        if (RULE_BY_SHARE.equalsIgnoreCase(rule)) {
            BigDecimal totalShare = BigDecimal.ZERO;
            for (EdiSupplierMaterial relation : relations) {
                totalShare = totalShare.add(relation.getSharePct() == null ? BigDecimal.ZERO : relation.getSharePct());
            }
            if (totalShare.compareTo(BigDecimal.ZERO) > 0) {
                for (EdiSupplierMaterial relation : relations) {
                    BigDecimal share = relation.getSharePct() == null ? BigDecimal.ZERO : relation.getSharePct();
                    result.add(qty.multiply(share).divide(totalShare, 4, RoundingMode.HALF_UP));
                }
                return result;
            }
        }

        // MANUAL 或份额合计为 0 时平均分配
        BigDecimal average = qty.divide(BigDecimal.valueOf(size), 4, RoundingMode.HALF_UP);
        for (int i = 0; i < size; i++) {
            result.add(average);
        }
        return result;
    }
}
