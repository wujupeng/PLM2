package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.AuditLogQuery;
import com.huaweicloud.plm.system.entity.SysAuditLog;
import com.huaweicloud.plm.system.mapper.SysAuditLogMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final SysAuditLogMapper auditLogMapper;

    public PageResult<SysAuditLog> page(AuditLogQuery query) {
        Page<SysAuditLog> page = query.toPage();
        auditLogMapper.selectPage(page, Wrappers.<SysAuditLog>lambdaQuery()
                .eq(StringUtils.hasText(query.getModule()), SysAuditLog::getModule, query.getModule())
                .eq(query.getSuccess() != null, SysAuditLog::getSuccess, query.getSuccess())
                .like(StringUtils.hasText(query.getUsername()), SysAuditLog::getUsername, query.getUsername())
                .orderByDesc(SysAuditLog::getCreatedAt));
        return PageResult.of(page);
    }

    /**
     * 记录审计日志，失败不影响主业务流程。
     */
    public void record(SysAuditLog auditLog) {
        try {
            auditLogMapper.insert(auditLog);
        } catch (Exception ex) {
            log.warn("审计日志写入失败: {}", ex.getMessage());
        }
    }
}
