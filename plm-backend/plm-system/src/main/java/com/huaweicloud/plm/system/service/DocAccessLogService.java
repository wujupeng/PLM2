package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.DocAccessLogQuery;
import com.huaweicloud.plm.system.entity.OaDocAccessLog;
import com.huaweicloud.plm.system.mapper.OaDocAccessLogMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 文档访问审计服务：记录查看、预览、下载、编辑、删除、分享与恢复，
 * 作为 OA-UAT-05「版本记录、访问日志」证据，并支持按文档/用户/动作回溯。
 */
@Service
@RequiredArgsConstructor
public class DocAccessLogService {

    public static final String ACTION_VIEW = "VIEW";
    public static final String ACTION_PREVIEW = "PREVIEW";
    public static final String ACTION_DOWNLOAD = "DOWNLOAD";
    public static final String ACTION_EDIT = "EDIT";
    public static final String ACTION_DELETE = "DELETE";
    public static final String ACTION_SHARE = "SHARE";
    public static final String ACTION_RESTORE = "RESTORE";

    private final OaDocAccessLogMapper accessLogMapper;

    /** 写入一条访问审计记录，客户端地址与终端信息尽力采集，采集失败不影响主业务。 */
    public void record(Long docId, Long versionId, Long folderId, String action, String detail) {
        OaDocAccessLog log = new OaDocAccessLog();
        log.setDocId(docId);
        log.setVersionId(versionId);
        log.setFolderId(folderId);
        log.setUserId(UserContext.getUserId());
        log.setUserName(UserContext.getUsername());
        log.setAction(action);
        log.setActionDetail(detail);
        log.setClientIp(clientIp());
        log.setUserAgent(userAgent());
        log.setOccurredAt(LocalDateTime.now());
        accessLogMapper.insert(log);
    }

    public PageResult<OaDocAccessLog> page(DocAccessLogQuery query) {
        Page<OaDocAccessLog> page = query.toPage();
        accessLogMapper.selectPage(page, Wrappers.<OaDocAccessLog>lambdaQuery()
                .eq(query.getDocId() != null, OaDocAccessLog::getDocId, query.getDocId())
                .eq(query.getUserId() != null, OaDocAccessLog::getUserId, query.getUserId())
                .eq(StringUtils.hasText(query.getAction()), OaDocAccessLog::getAction,
                        query.getAction() == null ? null : query.getAction().trim().toUpperCase())
                .ge(StringUtils.hasText(query.getStartDate()), OaDocAccessLog::getOccurredAt,
                        startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaDocAccessLog::getOccurredAt,
                        endOfDay(query.getEndDate()))
                .orderByDesc(OaDocAccessLog::getId));
        return PageResult.of(page);
    }

    /** 日期转换需 null-safe：条件构造器会提前求值参数表达式。 */
    private LocalDateTime startOfDay(String date) {
        if (!StringUtils.hasText(date)) {
            return null;
        }
        try {
            return LocalDate.parse(date.trim()).atStartOfDay();
        } catch (RuntimeException e) {
            return null;
        }
    }

    private LocalDateTime endOfDay(String date) {
        if (!StringUtils.hasText(date)) {
            return null;
        }
        try {
            return LocalDate.parse(date.trim()).atTime(LocalTime.MAX);
        } catch (RuntimeException e) {
            return null;
        }
    }

    private String clientIp() {
        HttpServletRequest request = currentRequest();
        if (request == null) {
            return null;
        }
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            int comma = forwarded.indexOf(',');
            return comma > -1 ? forwarded.substring(0, comma).trim() : forwarded.trim();
        }
        return request.getRemoteAddr();
    }

    private String userAgent() {
        HttpServletRequest request = currentRequest();
        if (request == null) {
            return null;
        }
        String agent = request.getHeader("User-Agent");
        if (agent != null && agent.length() > 250) {
            return agent.substring(0, 250);
        }
        return agent;
    }

    private HttpServletRequest currentRequest() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            return attributes.getRequest();
        }
        return null;
    }
}
