package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IntegrationQuery;
import com.huaweicloud.plm.system.dto.SysIntegrationMonitorSaveRequest;
import com.huaweicloud.plm.system.entity.SysIntegrationMonitor;
import com.huaweicloud.plm.system.mapper.SysIntegrationMonitorMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 集成监控（G1-N1 集成平台，WBS T009）：按系统/目标/小时汇总调用量与耗时，
 * 依据失败率推导健康度与告警。告警失败率阈值取自可配置项 integration.monitor.alert.fail.rate。
 */
@Service
@RequiredArgsConstructor
public class SysIntegrationMonitorService {

    private static final String STATUS_HEALTHY = "HEALTHY";
    private static final String STATUS_WARNING = "WARNING";
    private static final String STATUS_CRITICAL = "CRITICAL";
    private static final String TARGET_API = "API";
    private static final DateTimeFormatter DAY_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final SysIntegrationMonitorMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询集成监控：关键字匹配编号/系统/目标，字段精确，日期区间按监控日期字符串比较。 */
    public PageResult<SysIntegrationMonitor> pageMonitors(IntegrationQuery query) {
        Page<SysIntegrationMonitor> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysIntegrationMonitor>lambdaQuery()
                .eq(StringUtils.hasText(query.getSystemCode()),
                        SysIntegrationMonitor::getSystemCode, query.getSystemCode())
                .eq(StringUtils.hasText(query.getTargetType()),
                        SysIntegrationMonitor::getTargetType, query.getTargetType())
                .eq(StringUtils.hasText(query.getHealthStatus()),
                        SysIntegrationMonitor::getHealthStatus, query.getHealthStatus())
                .ge(StringUtils.hasText(query.getStartDate()),
                        SysIntegrationMonitor::getMonitorDay, query.getStartDate())
                .le(StringUtils.hasText(query.getEndDate()),
                        SysIntegrationMonitor::getMonitorDay, query.getEndDate())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysIntegrationMonitor::getMonitorNo, query.getKeyword()).or()
                        .like(SysIntegrationMonitor::getSystemCode, query.getKeyword()).or()
                        .like(SysIntegrationMonitor::getTargetCode, query.getKeyword()).or()
                        .like(SysIntegrationMonitor::getTargetName, query.getKeyword()))
                .orderByDesc(SysIntegrationMonitor::getId));
        return PageResult.of(page);
    }

    public SysIntegrationMonitor detail(Long id) {
        return require(id);
    }

    /** 新增或更新集成监控：补全默认值并按失败率推导健康度与告警。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysIntegrationMonitorSaveRequest request) {
        SysIntegrationMonitor entity;
        if (id == null) {
            entity = new SysIntegrationMonitor();
            entity.setMonitorNo(StringUtils.hasText(request.getMonitorNo())
                    ? request.getMonitorNo() : flowSupport.nextBizNo("MON"));
            entity.setMonitorDay(StringUtils.hasText(request.getMonitorDay())
                    ? request.getMonitorDay() : LocalDate.now().format(DAY_FORMATTER));
            entity.setStatHour(request.getStatHour() != null ? request.getStatHour() : 0);
            entity.setSystemCode(request.getSystemCode());
            entity.setTargetType(StringUtils.hasText(request.getTargetType())
                    ? request.getTargetType() : TARGET_API);
            entity.setTotalCount(defaultZero(request.getTotalCount()));
            entity.setSuccessCount(defaultZero(request.getSuccessCount()));
            entity.setFailCount(defaultZero(request.getFailCount()));
            entity.setAvgCostMs(defaultZero(request.getAvgCostMs()));
            entity.setMaxCostMs(defaultZero(request.getMaxCostMs()));
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getMonitorNo())) {
                entity.setMonitorNo(request.getMonitorNo());
            }
            if (StringUtils.hasText(request.getMonitorDay())) {
                entity.setMonitorDay(request.getMonitorDay());
            }
            if (request.getStatHour() != null) {
                entity.setStatHour(request.getStatHour());
            }
            if (StringUtils.hasText(request.getSystemCode())) {
                entity.setSystemCode(request.getSystemCode());
            }
            if (StringUtils.hasText(request.getTargetType())) {
                entity.setTargetType(request.getTargetType());
            }
            if (request.getTotalCount() != null) {
                entity.setTotalCount(request.getTotalCount());
            }
            if (request.getSuccessCount() != null) {
                entity.setSuccessCount(request.getSuccessCount());
            }
            if (request.getFailCount() != null) {
                entity.setFailCount(request.getFailCount());
            }
            if (request.getAvgCostMs() != null) {
                entity.setAvgCostMs(request.getAvgCostMs());
            }
            if (request.getMaxCostMs() != null) {
                entity.setMaxCostMs(request.getMaxCostMs());
            }
        }
        entity.setTargetCode(request.getTargetCode());
        entity.setTargetName(request.getTargetName());
        entity.setOrgName(request.getOrgName());
        entity.setRemark(request.getRemark());
        deriveHealth(entity);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 重新汇总：按当前计数重新执行健康度推导并回写。 */
    @Transactional(rollbackFor = Exception.class)
    public SysIntegrationMonitor aggregate(Long id) {
        SysIntegrationMonitor entity = require(id);
        deriveHealth(entity);
        mapper.updateById(entity);
        return entity;
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.deleteById(id);
    }

    /** 集成监控统计：健康度与告警计数，以及全部记录调用量的汇总口径失败率。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("healthy", countByHealth(STATUS_HEALTHY));
        result.put("warning", countByHealth(STATUS_WARNING));
        result.put("critical", countByHealth(STATUS_CRITICAL));
        result.put("alertCount", mapper.selectCount(Wrappers.<SysIntegrationMonitor>lambdaQuery()
                .eq(SysIntegrationMonitor::getAlertFlag, 1)));

        List<SysIntegrationMonitor> all = mapper.selectList(null);
        long totalCount = all.stream().mapToLong(m -> m.getTotalCount() == null ? 0 : m.getTotalCount()).sum();
        long successCount = all.stream().mapToLong(m -> m.getSuccessCount() == null ? 0 : m.getSuccessCount()).sum();
        long failCount = all.stream().mapToLong(m -> m.getFailCount() == null ? 0 : m.getFailCount()).sum();
        result.put("totalCount", totalCount);
        result.put("successCount", successCount);
        result.put("failCount", failCount);
        result.put("failRate", totalCount <= 0 ? 0L : Math.round(failCount * 100.0 / totalCount));
        result.put("alertFailRate", flowSupport.configInt("integration.monitor.alert.fail.rate", 5));
        return result;
    }

    public SysIntegrationMonitor require(Long id) {
        SysIntegrationMonitor entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "集成监控记录不存在: " + id);
        }
        return entity;
    }

    /**
     * 健康度推导：基数取 totalCount，失败率 = failCount*100/totalCount 四舍五入。
     * 失败率达到阈值且阈值大于 0 判为 CRITICAL 并置告警；否则有失败判 WARNING；否则 HEALTHY。
     */
    private void deriveHealth(SysIntegrationMonitor entity) {
        int total = entity.getTotalCount() == null ? 0 : entity.getTotalCount();
        int fail = entity.getFailCount() == null ? 0 : entity.getFailCount();
        int threshold = flowSupport.configInt("integration.monitor.alert.fail.rate", 5);
        int failRate = total <= 0 ? 0 : (int) Math.round(fail * 100.0 / total);
        if (total > 0 && threshold > 0 && failRate >= threshold) {
            entity.setHealthStatus(STATUS_CRITICAL);
            entity.setAlertFlag(1);
            entity.setAlertMessage("失败率 " + failRate + "% 超过阈值 " + threshold + "%");
        } else if (fail > 0) {
            entity.setHealthStatus(STATUS_WARNING);
            entity.setAlertFlag(0);
            entity.setAlertMessage(null);
        } else {
            entity.setHealthStatus(STATUS_HEALTHY);
            entity.setAlertFlag(0);
            entity.setAlertMessage(null);
        }
    }

    private int defaultZero(Integer value) {
        return value == null ? 0 : value;
    }

    private Long countByHealth(String healthStatus) {
        Long count = mapper.selectCount(Wrappers.<SysIntegrationMonitor>lambdaQuery()
                .eq(SysIntegrationMonitor::getHealthStatus, healthStatus));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
