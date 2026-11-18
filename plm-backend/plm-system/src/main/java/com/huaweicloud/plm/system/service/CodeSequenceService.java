package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.CodeSequenceQuery;
import com.huaweicloud.plm.system.entity.CodeSequence;
import com.huaweicloud.plm.system.mapper.CodeSequenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 每日流水号服务（N5）：按维度取号，事务内行级锁保证并发安全，达上限不回绕。
 */
@Service
@RequiredArgsConstructor
public class CodeSequenceService {

    private static final int DEFAULT_MAX_VALUE = 9999;
    private static final String SEPARATOR = "|";

    private final CodeSequenceMapper codeSequenceMapper;

    /**
     * 取下一个流水号（事务内行级锁保证并发安全，不回绕）。
     */
    @Transactional(rollbackFor = Exception.class)
    public SequenceNext next(String seqKey, String seqDimension, LocalDate seqDate,
                             int seqLength, int maxValue, int warnThreshold) {
        int effectiveMax = maxValue <= 0 ? DEFAULT_MAX_VALUE : maxValue;
        CodeSequence sequence = loadOrInit(seqKey, seqDimension, seqDate, effectiveMax, warnThreshold);

        int current = sequence.getCurrentValue() == null ? 0 : sequence.getCurrentValue();
        int nextValue = current + 1;
        if (nextValue > effectiveMax) {
            throw new BusinessException(ResultCode.CONFLICT,
                    "每日流水号已达上限 " + effectiveMax + "，系统不回绕，请业务方处理");
        }

        boolean warn = false;
        String message = null;
        sequence.setCurrentValue(nextValue);
        sequence.setLastGeneratedAt(LocalDateTime.now());
        if (warnThreshold > 0 && nextValue >= warnThreshold) {
            sequence.setWarnFlag(1);
            warn = true;
            message = "每日流水号已使用 " + nextValue + "/" + effectiveMax + "，接近上限请业务方关注";
        }
        codeSequenceMapper.updateById(sequence);

        String code = seqLength > 0 ? String.format("%0" + seqLength + "d", nextValue) : String.valueOf(nextValue);
        return new SequenceNext(nextValue, code, warn, message, effectiveMax);
    }

    /**
     * 只读查询当前状态，不存在返回 null。
     */
    public CodeSequence find(String seqKey) {
        return codeSequenceMapper.selectOne(Wrappers.<CodeSequence>lambdaQuery()
                .eq(CodeSequence::getSeqKey, seqKey));
    }

    public PageResult<CodeSequence> page(CodeSequenceQuery query) {
        Page<CodeSequence> page = query.toPage();
        codeSequenceMapper.selectPage(page, Wrappers.<CodeSequence>lambdaQuery()
                .eq(StringUtils.hasText(query.getSeqKey()), CodeSequence::getSeqKey, query.getSeqKey())
                .eq(StringUtils.hasText(query.getSeqDimension()), CodeSequence::getSeqDimension, query.getSeqDimension())
                .ge(query.getSeqDateFrom() != null, CodeSequence::getSeqDate, query.getSeqDateFrom())
                .le(query.getSeqDateTo() != null, CodeSequence::getSeqDate, query.getSeqDateTo())
                .eq(query.getWarnFlag() != null, CodeSequence::getWarnFlag, query.getWarnFlag())
                .orderByDesc(CodeSequence::getUpdatedAt));
        return PageResult.of(page);
    }

    /**
     * 重置某维度的流水号（current_value 置 0、warn_flag 置 0），不存在则抛 NOT_FOUND。
     */
    @Transactional(rollbackFor = Exception.class)
    public void reset(String seqKey) {
        CodeSequence sequence = codeSequenceMapper.selectByKeyForUpdate(seqKey);
        if (sequence == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "流水号不存在: " + seqKey);
        }
        sequence.setCurrentValue(0);
        sequence.setWarnFlag(0);
        codeSequenceMapper.updateById(sequence);
    }

    /**
     * 拼装 seqKey：codeType + "|" + scopeKey + "|" + 日期后缀；DAY 维度后缀为 yyyy+DDD(3 位自然日)，MONTH 维度为 yyyyMM，其它为 "GLOBAL"。
     */
    public String buildSeqKey(String codeType, String scopeKey, String seqDimension, LocalDate date) {
        String scope = StringUtils.hasText(scopeKey) ? scopeKey : "-";
        LocalDate targetDate = date == null ? LocalDate.now() : date;
        String dimension = StringUtils.hasText(seqDimension) ? seqDimension.trim().toUpperCase() : "DAY";
        String suffix;
        switch (dimension) {
            case "MONTH" -> suffix = String.format("%04d%02d", targetDate.getYear(), targetDate.getMonthValue());
            case "DAY" -> suffix = String.format("%04d%03d", targetDate.getYear(), targetDate.getDayOfYear());
            default -> suffix = "GLOBAL";
        }
        return codeType + SEPARATOR + scope + SEPARATOR + suffix;
    }

    /**
     * 加载流水号，不存在则初始化；并发首次创建依赖唯一索引兜底，冲突后重读（最多重试 1 次）。
     */
    private CodeSequence loadOrInit(String seqKey, String seqDimension, LocalDate seqDate,
                                    int maxValue, int warnThreshold) {
        CodeSequence sequence = codeSequenceMapper.selectByKeyForUpdate(seqKey);
        if (sequence != null) {
            return sequence;
        }
        for (int attempt = 0; attempt <= 1; attempt++) {
            try {
                CodeSequence created = new CodeSequence();
                created.setSeqKey(seqKey);
                created.setSeqDimension(seqDimension);
                created.setSeqDate(seqDate);
                created.setInitValue(1);
                created.setCurrentValue(0);
                created.setMaxValue(maxValue);
                created.setWarnThreshold(warnThreshold);
                created.setWarnFlag(0);
                codeSequenceMapper.insert(created);
            } catch (DuplicateKeyException ignored) {
                // 并发首次创建冲突，重新加锁读取
            }
            sequence = codeSequenceMapper.selectByKeyForUpdate(seqKey);
            if (sequence != null) {
                return sequence;
            }
        }
        throw new BusinessException(ResultCode.CONFLICT, "流水号初始化并发冲突，请重试");
    }

    /** 流水号结果。 */
    public record SequenceNext(int value, String code, boolean warn, String message, int maxValue) {
    }
}
