package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.EdiAckQuery;
import com.huaweicloud.plm.system.dto.EdiAckRequest;
import com.huaweicloud.plm.system.entity.EdiCustomerDemand;
import com.huaweicloud.plm.system.entity.EdiDemandDispatch;
import com.huaweicloud.plm.system.entity.EdiSupplierAck;
import com.huaweicloud.plm.system.mapper.EdiCustomerDemandMapper;
import com.huaweicloud.plm.system.mapper.EdiDemandDispatchMapper;
import com.huaweicloud.plm.system.mapper.EdiSupplierAckMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 供应商确认与回执服务（N6，DEV-071）：登记回执并回写分发与需求状态。
 */
@Service
@RequiredArgsConstructor
public class EdiSupplierAckService {

    private static final String ACK_TYPE_CONFIRM = "CONFIRM";
    private static final String ACK_TYPE_SHORTAGE = "SHORTAGE";
    private static final String ACK_TYPE_REJECT = "REJECT";
    private static final String ACK_TYPE_EXCEPTION = "EXCEPTION";
    private static final String ACK_STATUS_CONFIRMED = "CONFIRMED";
    private static final String ACK_STATUS_SHORTAGE = "SHORTAGE";
    private static final String ACK_STATUS_REJECTED = "REJECTED";
    private static final String SEND_STATUS_ACKED = "ACKED";
    private static final String DEMAND_STATUS_CONFIRMED = "CONFIRMED";
    private static final String DEMAND_STATUS_CHANGED = "CHANGED";
    private static final String SOURCE_DEFAULT = "API";

    private final EdiSupplierAckMapper ediSupplierAckMapper;
    private final EdiDemandDispatchMapper ediDemandDispatchMapper;
    private final EdiCustomerDemandMapper ediCustomerDemandMapper;
    private final EdiSupportService ediSupport;

    /**
     * 登记供应商回执并回写分发、需求状态。
     */
    @Transactional(rollbackFor = Exception.class)
    public Long ack(EdiAckRequest request) {
        EdiDemandDispatch dispatch = ediDemandDispatchMapper.selectOne(Wrappers.<EdiDemandDispatch>lambdaQuery()
                .eq(EdiDemandDispatch::getDispatchNo, request.getDispatchNo()));
        if (dispatch == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "分发记录不存在: " + request.getDispatchNo());
        }

        LocalDateTime now = LocalDateTime.now();
        String ackType = StringUtils.hasText(request.getAckType()) ? request.getAckType() : ACK_TYPE_CONFIRM;
        BigDecimal confirmedQty = request.getConfirmedQty() != null ? request.getConfirmedQty() : dispatch.getQty();

        EdiSupplierAck ack = new EdiSupplierAck();
        ack.setAckNo(ediSupport.nextNo("ACK"));
        ack.setDispatchId(dispatch.getId());
        ack.setDispatchNo(dispatch.getDispatchNo());
        ack.setSupplierCode(StringUtils.hasText(request.getSupplierCode())
                ? request.getSupplierCode() : dispatch.getSupplierCode());
        ack.setAckType(ackType);
        ack.setConfirmedQty(confirmedQty);
        ack.setConfirmedDate(request.getConfirmedDate());
        ack.setShortageQty(request.getShortageQty());
        ack.setShortageReason(request.getShortageReason());
        ack.setExceptionText(request.getExceptionText());
        ack.setSource(StringUtils.hasText(request.getSource()) ? request.getSource() : SOURCE_DEFAULT);
        ack.setAckAt(now);
        ack.setRemark(request.getRemark());
        ack.setDiffFlag(resolveDiffFlag(confirmedQty, dispatch.getQty(),
                request.getConfirmedDate(), dispatch.getRequiredDate()));
        ediSupplierAckMapper.insert(ack);

        dispatch.setAckStatus(resolveAckStatus(ackType));
        dispatch.setAckAt(now);
        if (!ACK_TYPE_REJECT.equalsIgnoreCase(ackType)) {
            dispatch.setSendStatus(SEND_STATUS_ACKED);
        }
        ediDemandDispatchMapper.updateById(dispatch);

        EdiCustomerDemand demand = dispatch.getDemandId() != null
                ? ediCustomerDemandMapper.selectById(dispatch.getDemandId())
                : ediCustomerDemandMapper.selectOne(Wrappers.<EdiCustomerDemand>lambdaQuery()
                        .eq(EdiCustomerDemand::getDemandNo, dispatch.getDemandNo()));
        if (demand != null) {
            boolean shortage = ACK_TYPE_SHORTAGE.equalsIgnoreCase(ackType)
                    || ACK_TYPE_REJECT.equalsIgnoreCase(ackType)
                    || ACK_TYPE_EXCEPTION.equalsIgnoreCase(ackType);
            demand.setStatus(shortage ? DEMAND_STATUS_CHANGED : DEMAND_STATUS_CONFIRMED);
            ediCustomerDemandMapper.updateById(demand);
        }

        ediSupport.writeLog(dispatch.getDemandNo(), null, "862", "INBOUND", "ACK",
                "SUCCESS", "收到供应商回执：" + ackType, ack.getAckNo());
        return ack.getId();
    }

    public PageResult<EdiSupplierAck> page(EdiAckQuery query) {
        Page<EdiSupplierAck> page = query.toPage();
        ediSupplierAckMapper.selectPage(page, Wrappers.<EdiSupplierAck>lambdaQuery()
                .eq(StringUtils.hasText(query.getDispatchNo()), EdiSupplierAck::getDispatchNo, query.getDispatchNo())
                .eq(StringUtils.hasText(query.getSupplierCode()), EdiSupplierAck::getSupplierCode, query.getSupplierCode())
                .eq(StringUtils.hasText(query.getAckType()), EdiSupplierAck::getAckType, query.getAckType())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(EdiSupplierAck::getAckNo, query.getKeyword()).or()
                        .like(EdiSupplierAck::getDispatchNo, query.getKeyword()))
                .orderByDesc(EdiSupplierAck::getId));
        return PageResult.of(page);
    }

    public EdiSupplierAck requireAck(String ackNo) {
        EdiSupplierAck ack = ediSupplierAckMapper.selectOne(Wrappers.<EdiSupplierAck>lambdaQuery()
                .eq(EdiSupplierAck::getAckNo, ackNo));
        if (ack == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "回执记录不存在: " + ackNo);
        }
        return ack;
    }

    public List<EdiSupplierAck> listByDispatch(String dispatchNo) {
        return ediSupplierAckMapper.selectList(Wrappers.<EdiSupplierAck>lambdaQuery()
                .eq(EdiSupplierAck::getDispatchNo, dispatchNo)
                .orderByDesc(EdiSupplierAck::getId));
    }

    /**
     * 回执类型映射为分发回执状态。
     */
    private String resolveAckStatus(String ackType) {
        if (ACK_TYPE_SHORTAGE.equalsIgnoreCase(ackType)) {
            return ACK_STATUS_SHORTAGE;
        }
        if (ACK_TYPE_REJECT.equalsIgnoreCase(ackType)) {
            return ACK_STATUS_REJECTED;
        }
        return ACK_STATUS_CONFIRMED;
    }

    /**
     * 判断回执是否存在差异：确认数量与分发数量不等，或确认交期与需求交期不符。
     */
    private int resolveDiffFlag(BigDecimal confirmedQty, BigDecimal dispatchQty,
                                LocalDate confirmedDate, LocalDate requiredDate) {
        if (confirmedQty != null && dispatchQty != null && confirmedQty.compareTo(dispatchQty) != 0) {
            return 1;
        }
        if (confirmedDate != null && requiredDate != null && !confirmedDate.equals(requiredDate)) {
            return 1;
        }
        return 0;
    }
}
