package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OaGoliveQuery;
import com.huaweicloud.plm.system.dto.OaGoliveWatchSaveRequest;
import com.huaweicloud.plm.system.entity.OaGoliveWatch;
import com.huaweicloud.plm.system.mapper.OaGoliveWatchMapper;
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
 * 上线值守与问题响应（OA-DEV-117）：值守班次、值守人员、监控范围与各业务量、问题闭环情况维护。
 * 严重问题阈值与值守班次为可配置项，便于按上线计划调整。
 */
@Service
@RequiredArgsConstructor
public class OaGoliveWatchService {

    private static final String SHIFT_FULL = "FULL";
    private static final String ROLE_TECH = "TECH";
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_CLOSED = "CLOSED";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaGoliveWatchMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaGoliveWatch> pageWatches(OaGoliveQuery query) {
        Page<OaGoliveWatch> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaGoliveWatch>lambdaQuery()
                .eq(StringUtils.hasText(query.getDutyRole()), OaGoliveWatch::getDutyRole, query.getDutyRole())
                .eq(StringUtils.hasText(query.getWatchStatus()), OaGoliveWatch::getWatchStatus, query.getWatchStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaGoliveWatch::getWatchNo, query.getKeyword()).or()
                        .like(OaGoliveWatch::getWatchName, query.getKeyword()).or()
                        .like(OaGoliveWatch::getDutyPerson, query.getKeyword()))
                .orderByDesc(OaGoliveWatch::getId));
        return PageResult.of(page);
    }

    public OaGoliveWatch detail(Long id) {
        return requireWatch(id);
    }

    @Transactional
    public Long save(Long id, OaGoliveWatchSaveRequest request) {
        OaGoliveWatch entity;
        if (id == null) {
            entity = new OaGoliveWatch();
            entity.setWatchNo(StringUtils.hasText(request.getWatchNo())
                    ? request.getWatchNo() : flowSupport.nextBizNo("GW"));
            entity.setWatchShift(StringUtils.hasText(request.getWatchShift())
                    ? request.getWatchShift() : SHIFT_FULL);
            entity.setDutyRole(StringUtils.hasText(request.getDutyRole())
                    ? request.getDutyRole() : ROLE_TECH);
            entity.setLoginCount(0);
            entity.setFlowCount(0);
            entity.setMailCount(0);
            entity.setDocCount(0);
            entity.setApiCount(0);
            entity.setIssueCount(0);
            entity.setCriticalIssueCount(0);
            entity.setClosedIssueCount(0);
            entity.setWatchStatus(StringUtils.hasText(request.getWatchStatus())
                    ? request.getWatchStatus() : STATUS_PENDING);
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireWatch(id);
            if (StringUtils.hasText(request.getWatchNo())) {
                entity.setWatchNo(request.getWatchNo());
            }
            if (StringUtils.hasText(request.getWatchShift())) {
                entity.setWatchShift(request.getWatchShift());
            }
            if (StringUtils.hasText(request.getDutyRole())) {
                entity.setDutyRole(request.getDutyRole());
            }
            if (StringUtils.hasText(request.getWatchStatus())) {
                entity.setWatchStatus(request.getWatchStatus());
            }
        }
        entity.setWatchName(request.getWatchName());
        entity.setDutyPerson(request.getDutyPerson());
        entity.setMonitorScope(request.getMonitorScope());
        if (request.getLoginCount() != null) {
            entity.setLoginCount(request.getLoginCount());
        }
        if (request.getFlowCount() != null) {
            entity.setFlowCount(request.getFlowCount());
        }
        if (request.getMailCount() != null) {
            entity.setMailCount(request.getMailCount());
        }
        if (request.getDocCount() != null) {
            entity.setDocCount(request.getDocCount());
        }
        if (request.getApiCount() != null) {
            entity.setApiCount(request.getApiCount());
        }
        if (request.getIssueCount() != null) {
            entity.setIssueCount(request.getIssueCount());
        }
        if (request.getCriticalIssueCount() != null) {
            entity.setCriticalIssueCount(request.getCriticalIssueCount());
        }
        if (request.getClosedIssueCount() != null) {
            entity.setClosedIssueCount(request.getClosedIssueCount());
        }
        entity.setReportSummary(request.getReportSummary());
        entity.setWatchTime(parseTimestamp(request.getWatchTime()));
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    @Transactional
    public void delete(Long id) {
        requireWatch(id);
        mapper.deleteById(id);
    }

    /** 结束值守：状态置为 CLOSED，回写值守小结；若已闭环问题数少于问题总数则补齐并回写值守时间。 */
    @Transactional
    public OaGoliveWatch close(Long id, String reportSummary) {
        OaGoliveWatch entity = requireWatch(id);
        entity.setWatchStatus(STATUS_CLOSED);
        if (StringUtils.hasText(reportSummary)) {
            entity.setReportSummary(reportSummary);
        }
        int issueTotal = entity.getIssueCount() == null ? 0 : entity.getIssueCount();
        int closedTotal = entity.getClosedIssueCount() == null ? 0 : entity.getClosedIssueCount();
        if (closedTotal < issueTotal) {
            entity.setClosedIssueCount(issueTotal);
        }
        entity.setWatchTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 上线值守统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("open", mapper.selectCount(Wrappers.<OaGoliveWatch>lambdaQuery()
                .eq(OaGoliveWatch::getWatchStatus, STATUS_PENDING)));
        result.put("closed", mapper.selectCount(Wrappers.<OaGoliveWatch>lambdaQuery()
                .eq(OaGoliveWatch::getWatchStatus, STATUS_CLOSED)));
        List<OaGoliveWatch> all = mapper.selectList(null);
        int issueTotal = 0;
        int criticalIssueTotal = 0;
        int closedIssueTotal = 0;
        for (OaGoliveWatch item : all) {
            issueTotal += item.getIssueCount() == null ? 0 : item.getIssueCount();
            criticalIssueTotal += item.getCriticalIssueCount() == null ? 0 : item.getCriticalIssueCount();
            closedIssueTotal += item.getClosedIssueCount() == null ? 0 : item.getClosedIssueCount();
        }
        result.put("issueTotal", issueTotal);
        result.put("criticalIssueTotal", criticalIssueTotal);
        result.put("closedIssueTotal", closedIssueTotal);
        result.put("criticalThreshold", flowSupport.configInt("oa.golive.critical.issue.threshold", 0));
        return result;
    }

    public OaGoliveWatch requireWatch(Long id) {
        OaGoliveWatch entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "上线值守记录不存在: " + id);
        }
        return entity;
    }

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
