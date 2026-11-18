package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IntegrationQuery;
import com.huaweicloud.plm.system.dto.SysDeadLetterSaveRequest;
import com.huaweicloud.plm.system.entity.SysDeadLetter;
import com.huaweicloud.plm.system.mapper.SysDeadLetterMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 死信队列（G1-N1 集成平台 WBS T009）：投递失败事件的人工处理、忽略与重投维护。
 * 死信自动处理开关取自可配置项，默认人工处理，避免错误自动放行。
 */
@Service
@RequiredArgsConstructor
public class SysDeadLetterService {

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_HANDLED = "HANDLED";
    private static final String STATUS_IGNORED = "IGNORED";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final SysDeadLetterMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<SysDeadLetter> pageDeadLetters(IntegrationQuery query) {
        Page<SysDeadLetter> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysDeadLetter>lambdaQuery()
                .eq(StringUtils.hasText(query.getDeadStatus()),
                        SysDeadLetter::getDeadStatus, query.getDeadStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysDeadLetter::getLetterNo, query.getKeyword()).or()
                        .like(SysDeadLetter::getMessageKey, query.getKeyword()).or()
                        .like(SysDeadLetter::getTopicCode, query.getKeyword()).or()
                        .like(SysDeadLetter::getSubscriberSystem, query.getKeyword()))
                .orderByDesc(SysDeadLetter::getId));
        return PageResult.of(page);
    }

    public SysDeadLetter detail(Long id) {
        return requireLetter(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysDeadLetterSaveRequest request) {
        SysDeadLetter entity;
        if (id == null) {
            entity = new SysDeadLetter();
            entity.setLetterNo(StringUtils.hasText(request.getLetterNo())
                    ? request.getLetterNo() : flowSupport.nextBizNo("DL"));
            entity.setDeadStatus(StringUtils.hasText(request.getDeadStatus())
                    ? request.getDeadStatus() : STATUS_PENDING);
            entity.setRetryCount(request.getRetryCount() != null ? request.getRetryCount() : 0);
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireLetter(id);
            if (StringUtils.hasText(request.getLetterNo())) {
                entity.setLetterNo(request.getLetterNo());
            }
            if (StringUtils.hasText(request.getDeadStatus())) {
                entity.setDeadStatus(request.getDeadStatus());
            }
            if (request.getRetryCount() != null) {
                entity.setRetryCount(request.getRetryCount());
            }
        }
        entity.setMessageKey(request.getMessageKey());
        entity.setTopicCode(request.getTopicCode());
        entity.setSubscriberSystem(request.getSubscriberSystem());
        entity.setPayload(request.getPayload());
        entity.setFailReason(request.getFailReason());
        entity.setHandlerName(request.getHandlerName());
        entity.setHandledAt(parseTimestamp(request.getHandledAt()));
        entity.setHandleResult(request.getHandleResult());
        entity.setOrgName(request.getOrgName());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 人工处理死信：状态置为 HANDLED，处理结果为空时填默认值，处理人为空时取当前用户。 */
    @Transactional(rollbackFor = Exception.class)
    public SysDeadLetter handle(Long id, String handleResult, String handlerName) {
        SysDeadLetter entity = requireLetter(id);
        if (STATUS_HANDLED.equals(entity.getDeadStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "死信已处理，无需重复处理");
        }
        entity.setDeadStatus(STATUS_HANDLED);
        entity.setHandledAt(LocalDateTime.now());
        entity.setHandleResult(StringUtils.hasText(handleResult) ? handleResult : "人工处理完成");
        if (!StringUtils.hasText(handlerName)) {
            UserContext.Principal principal = UserContext.get();
            handlerName = principal == null ? null : principal.displayName();
        }
        entity.setHandlerName(handlerName);
        mapper.updateById(entity);
        return entity;
    }

    /** 忽略死信：状态置为 IGNORED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysDeadLetter ignore(Long id) {
        SysDeadLetter entity = requireLetter(id);
        entity.setDeadStatus(STATUS_IGNORED);
        mapper.updateById(entity);
        return entity;
    }

    /** 重投死信：状态复位为 PENDING，重试次数加一。 */
    @Transactional(rollbackFor = Exception.class)
    public SysDeadLetter retry(Long id) {
        SysDeadLetter entity = requireLetter(id);
        entity.setDeadStatus(STATUS_PENDING);
        entity.setRetryCount((entity.getRetryCount() == null ? 0 : entity.getRetryCount()) + 1);
        mapper.updateById(entity);
        return entity;
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        requireLetter(id);
        mapper.deleteById(id);
    }

    /** 死信队列统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("pending", mapper.selectCount(Wrappers.<SysDeadLetter>lambdaQuery()
                .eq(SysDeadLetter::getDeadStatus, STATUS_PENDING)));
        result.put("handled", mapper.selectCount(Wrappers.<SysDeadLetter>lambdaQuery()
                .eq(SysDeadLetter::getDeadStatus, STATUS_HANDLED)));
        result.put("ignored", mapper.selectCount(Wrappers.<SysDeadLetter>lambdaQuery()
                .eq(SysDeadLetter::getDeadStatus, STATUS_IGNORED)));
        List<SysDeadLetter> all = mapper.selectList(null);
        int retryTotal = 0;
        for (SysDeadLetter item : all) {
            retryTotal += item.getRetryCount() == null ? 0 : item.getRetryCount();
        }
        result.put("retryTotal", retryTotal);
        result.put("autoHandleEnabled", flowSupport.configBoolean("integration.deadletter.auto.handle", false) ? 1 : 0);
        return result;
    }

    public SysDeadLetter requireLetter(Long id) {
        SysDeadLetter entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "死信记录不存在: " + id);
        }
        return entity;
    }

    /** 解析时间字符串为 LocalDateTime，空白或非法返回 null。 */
    private LocalDateTime parseTimestamp(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return LocalDateTime.parse(value.trim(), TS_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
