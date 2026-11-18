package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.huaweicloud.plm.system.dto.OaIntegrationQuery;
import com.huaweicloud.plm.system.entity.OaApiAccessLog;
import com.huaweicloud.plm.system.entity.OaConnectorSyncLog;
import com.huaweicloud.plm.system.entity.OaEdiNotice;
import com.huaweicloud.plm.system.entity.OaIntegrationConnector;
import com.huaweicloud.plm.system.entity.OaMessageTask;
import com.huaweicloud.plm.system.entity.OaWebhookDelivery;
import com.huaweicloud.plm.system.mapper.OaApiAccessLogMapper;
import com.huaweicloud.plm.system.mapper.OaConnectorSyncLogMapper;
import com.huaweicloud.plm.system.mapper.OaEdiNoticeMapper;
import com.huaweicloud.plm.system.mapper.OaIntegrationConnectorMapper;
import com.huaweicloud.plm.system.mapper.OaMessageTaskMapper;
import com.huaweicloud.plm.system.mapper.OaWebhookDeliveryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 接口监控台（OA-DEV-094）：汇总 API 调用量/成功率/延迟、Webhook 投递、消息任务、连接器同步与 EDI 通知，
 * 提供凭证到期与失败补偿入口所需指标。
 */
@Service
@RequiredArgsConstructor
public class OaIntegrationMonitorService {

    private final OaApiAccessLogMapper accessLogMapper;
    private final OaWebhookDeliveryMapper deliveryMapper;
    private final OaMessageTaskMapper taskMapper;
    private final OaIntegrationConnectorMapper connectorMapper;
    private final OaConnectorSyncLogMapper syncLogMapper;
    private final OaEdiNoticeMapper ediNoticeMapper;
    private final OaApiGatewayService apiGatewayService;
    private final OaBizFlowSupport flowSupport;

    public Map<String, Object> overview(OaIntegrationQuery query) {
        LocalDateTime start = resolveStart(query);
        LocalDateTime end = resolveEnd(query);
        int windowDays = flowSupport.configInt("oa.integration.monitor.window.days", 30);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("windowDays", windowDays);
        result.put("startTime", start);
        result.put("endTime", end);

        // API 调用
        List<OaApiAccessLog> logs = accessLogMapper.selectList(Wrappers.<OaApiAccessLog>lambdaQuery()
                .ge(OaApiAccessLog::getAccessTime, start)
                .le(OaApiAccessLog::getAccessTime, end));
        long apiTotal = logs.size();
        long apiFail = logs.stream().filter(l -> l.getStatusCode() != null && l.getStatusCode() != 200).count();
        double apiAvgCost = logs.stream().filter(l -> l.getCostMs() != null)
                .mapToInt(OaApiAccessLog::getCostMs).average().orElse(0d);
        result.put("apiTotal", apiTotal);
        result.put("apiFail", apiFail);
        result.put("apiSuccessRate", rate(apiTotal - apiFail, apiTotal));
        result.put("apiAvgCostMs", Math.round(apiAvgCost));

        // Webhook 投递
        List<OaWebhookDelivery> deliveries = deliveryMapper.selectList(Wrappers.<OaWebhookDelivery>lambdaQuery()
                .ge(OaWebhookDelivery::getCreatedAt, start)
                .le(OaWebhookDelivery::getCreatedAt, end));
        long webhookTotal = deliveries.size();
        long webhookSuccess = deliveries.stream().filter(d -> "SUCCESS".equals(d.getDeliveryStatus())).count();
        long webhookDead = deliveries.stream().filter(d -> "DEAD".equals(d.getDeliveryStatus())).count();
        result.put("webhookTotal", webhookTotal);
        result.put("webhookDead", webhookDead);
        result.put("webhookSuccessRate", rate(webhookSuccess, webhookTotal));

        // 消息任务
        List<OaMessageTask> tasks = taskMapper.selectList(Wrappers.<OaMessageTask>lambdaQuery()
                .ge(OaMessageTask::getCreatedAt, start)
                .le(OaMessageTask::getCreatedAt, end));
        long taskTotal = tasks.size();
        long taskSuccess = tasks.stream().filter(t -> "SUCCESS".equals(t.getTaskStatus())).count();
        long taskDead = tasks.stream().filter(t -> "DEAD".equals(t.getTaskStatus())).count();
        result.put("taskTotal", taskTotal);
        result.put("taskDead", taskDead);
        result.put("taskSuccessRate", rate(taskSuccess, taskTotal));

        // 连接器与同步
        result.put("connectorTotal", connectorMapper.selectCount(Wrappers.<OaIntegrationConnector>lambdaQuery()
                .eq(OaIntegrationConnector::getStatus, 1)));
        List<OaConnectorSyncLog> syncLogs = syncLogMapper.selectList(Wrappers.<OaConnectorSyncLog>lambdaQuery()
                .ge(OaConnectorSyncLog::getSyncTime, start)
                .le(OaConnectorSyncLog::getSyncTime, end));
        long syncTotal = syncLogs.size();
        long syncFail = syncLogs.stream().filter(s -> !"SUCCESS".equals(s.getSyncStatus())).count();
        result.put("syncTotal", syncTotal);
        result.put("syncFail", syncFail);
        result.put("syncSuccessRate", rate(syncTotal - syncFail, syncTotal));

        // 连接器明细指标
        List<Map<String, Object>> connectorMetrics = new ArrayList<>();
        for (OaIntegrationConnector connector : connectorMapper.selectList(Wrappers.<OaIntegrationConnector>lambdaQuery()
                .orderByAsc(OaIntegrationConnector::getSystemCode))) {
            long total = syncLogs.stream()
                    .filter(s -> connector.getId().equals(s.getConnectorId())).count();
            long fail = syncLogs.stream()
                    .filter(s -> connector.getId().equals(s.getConnectorId()) && !"SUCCESS".equals(s.getSyncStatus())).count();
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("connectorId", connector.getId());
            item.put("connectorName", connector.getConnectorName());
            item.put("systemCode", connector.getSystemCode());
            item.put("syncTotal", total);
            item.put("syncFail", fail);
            item.put("successRate", rate(total - fail, total));
            item.put("lastSyncTime", connector.getLastSyncTime());
            connectorMetrics.add(item);
        }
        result.put("connectorMetrics", connectorMetrics);

        // EDI 通知
        result.put("ediTotal", ediNoticeMapper.selectCount(null));
        result.put("ediPending", ediNoticeMapper.selectCount(Wrappers.<OaEdiNotice>lambdaQuery()
                .eq(OaEdiNotice::getHandleStatus, "PENDING")));
        result.put("ediAlert", ediNoticeMapper.selectCount(Wrappers.<OaEdiNotice>lambdaQuery()
                .eq(OaEdiNotice::getAlertFlag, 1)));

        // 凭证到期
        result.put("credentialExpiring", apiGatewayService.listExpiringCredentials());
        result.put("credentialExpiringCount", apiGatewayService.listExpiringCredentials().size());
        return result;
    }

    private long rate(long success, long total) {
        if (total <= 0) {
            return 0L;
        }
        return Math.round(success * 10000d / total) / 100;
    }

    private LocalDateTime resolveStart(OaIntegrationQuery query) {
        LocalDateTime start = OaBizFlowSupport.startOfDay(query.getStartDate());
        if (start != null) {
            return start;
        }
        int days = flowSupport.configInt("oa.integration.monitor.window.days", 30);
        return LocalDate.now().minusDays(days).atStartOfDay();
    }

    private LocalDateTime resolveEnd(OaIntegrationQuery query) {
        LocalDateTime end = OaBizFlowSupport.endOfDay(query.getEndDate());
        return end != null ? end : LocalDateTime.now();
    }
}
