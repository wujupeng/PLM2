package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.EdiTransactionLogQuery;
import com.huaweicloud.plm.system.entity.EdiTransactionLog;
import com.huaweicloud.plm.system.mapper.EdiTransactionLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

/**
 * EDI 交易日志服务（N6，DEV-073）。
 */
@Service
@RequiredArgsConstructor
public class EdiTransactionLogService {

    private final EdiTransactionLogMapper ediTransactionLogMapper;

    public PageResult<EdiTransactionLog> page(EdiTransactionLogQuery query) {
        LocalDateTime from = query.getDateFrom() == null ? null : query.getDateFrom().atStartOfDay();
        LocalDateTime toExclusive = query.getDateTo() == null ? null : query.getDateTo().plusDays(1).atStartOfDay();
        Page<EdiTransactionLog> page = query.toPage();
        ediTransactionLogMapper.selectPage(page, Wrappers.<EdiTransactionLog>lambdaQuery()
                .eq(StringUtils.hasText(query.getMessageNo()), EdiTransactionLog::getMessageNo, query.getMessageNo())
                .eq(StringUtils.hasText(query.getPartnerCode()), EdiTransactionLog::getPartnerCode, query.getPartnerCode())
                .eq(StringUtils.hasText(query.getTransCode()), EdiTransactionLog::getTransCode, query.getTransCode())
                .eq(StringUtils.hasText(query.getActionType()), EdiTransactionLog::getActionType, query.getActionType())
                .eq(StringUtils.hasText(query.getResult()), EdiTransactionLog::getResult, query.getResult())
                .ge(from != null, EdiTransactionLog::getLogAt, from)
                .lt(toExclusive != null, EdiTransactionLog::getLogAt, toExclusive)
                .orderByDesc(EdiTransactionLog::getLogAt)
                .orderByDesc(EdiTransactionLog::getId));
        return PageResult.of(page);
    }

    public List<EdiTransactionLog> listByMessage(String messageNo) {
        return ediTransactionLogMapper.selectList(Wrappers.<EdiTransactionLog>lambdaQuery()
                .eq(EdiTransactionLog::getMessageNo, messageNo)
                .orderByAsc(EdiTransactionLog::getLogAt));
    }
}
