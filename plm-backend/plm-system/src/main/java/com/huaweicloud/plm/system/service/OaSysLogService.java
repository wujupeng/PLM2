package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizSysLogSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaSysLog;
import com.huaweicloud.plm.system.mapper.OaSysLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 日志中心（OA-DEV-085）：系统日志、业务日志、异常告警的记录、检索与处理。
 * 日志保留天数取自可配置项 oa.log.retention.days。
 */
@Service
@RequiredArgsConstructor
public class OaSysLogService {

    private static final String ALERT_NONE = "NONE";
    private static final String ALERT_PENDING = "PENDING";
    private static final String ALERT_HANDLED = "HANDLED";

    private final OaSysLogMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaSysLog> page(OaBizFlowQuery query) {
        Page<OaSysLog> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaSysLog>lambdaQuery()
                .eq(query.getOrgId() != null, OaSysLog::getOrgId, query.getOrgId())
                .eq(StringUtils.hasText(query.getTypeCode()), OaSysLog::getLogType, query.getTypeCode())
                .eq(StringUtils.hasText(query.getFlowStatus()), OaSysLog::getAlertStatus, query.getFlowStatus())
                .ge(StringUtils.hasText(query.getStartDate()), OaSysLog::getLogTime,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaSysLog::getLogTime,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaSysLog::getLogTitle, query.getKeyword()).or()
                        .like(OaSysLog::getLogContent, query.getKeyword()).or()
                        .like(OaSysLog::getLogModule, query.getKeyword()).or()
                        .like(OaSysLog::getOperatorName, query.getKeyword()))
                .orderByDesc(OaSysLog::getLogTime)
                .orderByDesc(OaSysLog::getId));
        return PageResult.of(page);
    }

    public OaSysLog detail(Long id) {
        return requireEntity(id);
    }

    /** 记录日志：供各业务模块与网关调用，自动补全操作人、时间与告警状态。 */
    @Transactional
    public Long record(BizSysLogSaveRequest request) {
        if (!StringUtils.hasText(request.getLogTitle())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "日志标题不能为空");
        }
        OaSysLog entity = new OaSysLog();
        entity.setLogType(StringUtils.hasText(request.getLogType()) ? request.getLogType() : "OPERATION");
        entity.setLogLevel(StringUtils.hasText(request.getLogLevel()) ? request.getLogLevel() : "INFO");
        entity.setLogModule(request.getLogModule());
        entity.setLogTitle(request.getLogTitle());
        entity.setLogContent(request.getLogContent());
        entity.setBizType(request.getBizType());
        entity.setBizId(request.getBizId());
        boolean alert = Boolean.TRUE.equals(request.getAlertFlag());
        entity.setAlertFlag(alert ? 1 : 0);
        entity.setAlertStatus(alert ? ALERT_PENDING : ALERT_NONE);
        entity.setOperatorUserId(UserContext.getUserId());
        UserContext.Principal principal = UserContext.get();
        entity.setOperatorName(principal == null ? null : principal.displayName());
        entity.setOrgId(principal == null ? null : principal.orgId());
        entity.setLogTime(LocalDateTime.now());
        entity.setRemark(request.getRemark());
        mapper.insert(entity);
        return entity.getId();
    }

    /** 处理告警：标记告警已处理并记录处理备注。 */
    @Transactional
    public void handleAlert(Long id, String handleRemark) {
        OaSysLog entity = requireEntity(id);
        if (!Integer.valueOf(1).equals(entity.getAlertFlag())) {
            throw new BusinessException(ResultCode.CONFLICT, "该日志非告警记录");
        }
        entity.setAlertStatus(ALERT_HANDLED);
        entity.setHandleRemark(handleRemark);
        mapper.updateById(entity);
    }

    /** 日志统计：按类型、级别与告警状态汇总。 */
    public Map<String, Long> stats(LocalDateTime start, LocalDateTime end) {
        Map<String, Long> result = new LinkedHashMap<>();
        result.put("total", countBy(start, end, null, null));
        result.put("error", countBy(start, end, null, "ERROR"));
        result.put("warn", countBy(start, end, null, "WARN"));
        result.put("alertPending", countAlert(start, end, ALERT_PENDING));
        result.put("alertHandled", countAlert(start, end, ALERT_HANDLED));
        result.put("retentionDays", (long) flowSupport.configInt("oa.log.retention.days", 180));
        return result;
    }

    /** 清理过期日志，返回清理条数。 */
    @Transactional
    public long cleanupExpired() {
        int retentionDays = flowSupport.configInt("oa.log.retention.days", 180);
        LocalDateTime threshold = LocalDateTime.now().minusDays(retentionDays);
        return mapper.delete(Wrappers.<OaSysLog>lambdaQuery()
                .lt(OaSysLog::getLogTime, threshold));
    }

    public OaSysLog requireEntity(Long id) {
        OaSysLog entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "日志不存在: " + id);
        }
        return entity;
    }

    private Long countBy(LocalDateTime start, LocalDateTime end, String logType, String logLevel) {
        Long count = mapper.selectCount(Wrappers.<OaSysLog>lambdaQuery()
                .eq(StringUtils.hasText(logType), OaSysLog::getLogType, logType)
                .eq(StringUtils.hasText(logLevel), OaSysLog::getLogLevel, logLevel)
                .ge(start != null, OaSysLog::getLogTime, start)
                .le(end != null, OaSysLog::getLogTime, end));
        return count == null ? 0L : count;
    }

    private Long countAlert(LocalDateTime start, LocalDateTime end, String alertStatus) {
        Long count = mapper.selectCount(Wrappers.<OaSysLog>lambdaQuery()
                .eq(OaSysLog::getAlertFlag, 1)
                .eq(OaSysLog::getAlertStatus, alertStatus)
                .ge(start != null, OaSysLog::getLogTime, start)
                .le(end != null, OaSysLog::getLogTime, end));
        return count == null ? 0L : count;
    }
}
