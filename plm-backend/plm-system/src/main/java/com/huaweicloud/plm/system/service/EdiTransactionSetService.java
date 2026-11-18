package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.EdiTransactionSetQuery;
import com.huaweicloud.plm.system.dto.EdiTransactionSetSaveRequest;
import com.huaweicloud.plm.system.entity.EdiTransactionSet;
import com.huaweicloud.plm.system.mapper.EdiTransactionSetMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * EDI 交易集配置服务（N6，DEV-074）。
 */
@Service
@RequiredArgsConstructor
public class EdiTransactionSetService {

    private static final String DEFAULT_PARTNER_CODE = "*";
    private static final String DEFAULT_DIRECTION = "INBOUND";
    private static final String DEFAULT_STANDARD = "X12";
    private static final String STATUS_ENABLED = "enabled";

    private final EdiTransactionSetMapper ediTransactionSetMapper;

    public PageResult<EdiTransactionSet> page(EdiTransactionSetQuery query) {
        Page<EdiTransactionSet> page = query.toPage();
        ediTransactionSetMapper.selectPage(page, Wrappers.<EdiTransactionSet>lambdaQuery()
                .eq(StringUtils.hasText(query.getPartnerCode()), EdiTransactionSet::getPartnerCode, query.getPartnerCode())
                .eq(StringUtils.hasText(query.getTransCode()), EdiTransactionSet::getTransCode, query.getTransCode())
                .eq(StringUtils.hasText(query.getDirection()), EdiTransactionSet::getDirection, query.getDirection())
                .eq(StringUtils.hasText(query.getStandard()), EdiTransactionSet::getStandard, query.getStandard())
                .eq(StringUtils.hasText(query.getStatus()), EdiTransactionSet::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(EdiTransactionSet::getTransCode, query.getKeyword()).or()
                        .like(EdiTransactionSet::getTransName, query.getKeyword()))
                .orderByAsc(EdiTransactionSet::getPartnerCode)
                .orderByAsc(EdiTransactionSet::getTransCode)
                .orderByAsc(EdiTransactionSet::getDirection));
        return PageResult.of(page);
    }

    public List<EdiTransactionSet> listByTransCode(String transCode) {
        return ediTransactionSetMapper.selectList(Wrappers.<EdiTransactionSet>lambdaQuery()
                .eq(EdiTransactionSet::getTransCode, transCode)
                .eq(EdiTransactionSet::getStatus, STATUS_ENABLED)
                .orderByAsc(EdiTransactionSet::getPartnerCode)
                .orderByAsc(EdiTransactionSet::getDirection));
    }

    public EdiTransactionSet requireById(Long id) {
        EdiTransactionSet transactionSet = ediTransactionSetMapper.selectById(id);
        if (transactionSet == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "EDI 交易集不存在: " + id);
        }
        return transactionSet;
    }

    public Long create(EdiTransactionSetSaveRequest request) {
        ensureUnique(request.getPartnerCode(), request.getTransCode(), request.getDirection(), -1L);
        EdiTransactionSet transactionSet = new EdiTransactionSet();
        applyRequest(transactionSet, request);
        ediTransactionSetMapper.insert(transactionSet);
        return transactionSet.getId();
    }

    public void update(Long id, EdiTransactionSetSaveRequest request) {
        EdiTransactionSet transactionSet = requireById(id);
        ensureUnique(request.getPartnerCode(), request.getTransCode(), request.getDirection(), id);
        applyRequest(transactionSet, request);
        ediTransactionSetMapper.updateById(transactionSet);
    }

    public void delete(Long id) {
        requireById(id);
        ediTransactionSetMapper.deleteById(id);
    }

    private void applyRequest(EdiTransactionSet transactionSet, EdiTransactionSetSaveRequest request) {
        transactionSet.setPartnerCode(StringUtils.hasText(request.getPartnerCode())
                ? request.getPartnerCode() : DEFAULT_PARTNER_CODE);
        transactionSet.setTransCode(request.getTransCode());
        transactionSet.setTransName(request.getTransName());
        transactionSet.setDirection(StringUtils.hasText(request.getDirection())
                ? request.getDirection() : DEFAULT_DIRECTION);
        transactionSet.setStandard(StringUtils.hasText(request.getStandard())
                ? request.getStandard() : DEFAULT_STANDARD);
        transactionSet.setStdVersion(request.getStdVersion());
        transactionSet.setHeaderSegTag(request.getHeaderSegTag());
        transactionSet.setLineSegTag(request.getLineSegTag());
        transactionSet.setAckTransCode(request.getAckTransCode());
        transactionSet.setAckRequired(request.getAckRequired() == null ? 1 : request.getAckRequired());
        transactionSet.setStatus(StringUtils.hasText(request.getStatus())
                ? request.getStatus() : STATUS_ENABLED);
        transactionSet.setDescription(request.getDescription());
        transactionSet.setRemark(request.getRemark());
    }

    private void ensureUnique(String partnerCode, String transCode, String direction, Long excludeId) {
        String resolvedPartnerCode = StringUtils.hasText(partnerCode) ? partnerCode : DEFAULT_PARTNER_CODE;
        String resolvedDirection = StringUtils.hasText(direction) ? direction : DEFAULT_DIRECTION;
        long count = ediTransactionSetMapper.selectCount(Wrappers.<EdiTransactionSet>lambdaQuery()
                .eq(EdiTransactionSet::getPartnerCode, resolvedPartnerCode)
                .eq(EdiTransactionSet::getTransCode, transCode)
                .eq(EdiTransactionSet::getDirection, resolvedDirection)
                .ne(excludeId != null && excludeId > 0, EdiTransactionSet::getId, excludeId));
        if (count > 0) {
            throw new BusinessException(ResultCode.CONFLICT,
                    "EDI 交易集已存在: " + resolvedPartnerCode + "/" + transCode + "/" + resolvedDirection);
        }
    }
}
