package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OaTestQuery;
import com.huaweicloud.plm.system.dto.OaUatRecordSaveRequest;
import com.huaweicloud.plm.system.entity.OaUatRecord;
import com.huaweicloud.plm.system.mapper.OaUatRecordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 用户验收（UAT）记录（OA-DEV-111）：验收场景、参与人、预期与实际结果、问题收敛与验收结论维护。
 * 验收状态与通过率阈值均为可配置数据，便于按业务方确认结果调整。
 */
@Service
@RequiredArgsConstructor
public class OaUatRecordService {

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_PASSED = "PASSED";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaUatRecordMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaUatRecord> pageUatRecords(OaTestQuery query) {
        Page<OaUatRecord> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaUatRecord>lambdaQuery()
                .eq(StringUtils.hasText(query.getDept()), OaUatRecord::getDept, query.getDept())
                .eq(StringUtils.hasText(query.getUatStatus()), OaUatRecord::getUatStatus, query.getUatStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaUatRecord::getUatNo, query.getKeyword()).or()
                        .like(OaUatRecord::getSceneName, query.getKeyword()).or()
                        .like(OaUatRecord::getScenarioRef, query.getKeyword()))
                .orderByDesc(OaUatRecord::getId));
        return PageResult.of(page);
    }

    public OaUatRecord detail(Long id) {
        return requireUatRecord(id);
    }

    @Transactional
    public Long save(Long id, OaUatRecordSaveRequest request) {
        OaUatRecord entity;
        if (id == null) {
            entity = new OaUatRecord();
            entity.setUatNo(StringUtils.hasText(request.getUatNo())
                    ? request.getUatNo() : flowSupport.nextBizNo("UAT"));
            entity.setUatStatus(StringUtils.hasText(request.getUatStatus()) ? request.getUatStatus() : STATUS_PENDING);
            entity.setIssueCount(request.getIssueCount() == null ? 0 : request.getIssueCount());
            entity.setBlockerCount(request.getBlockerCount() == null ? 0 : request.getBlockerCount());
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireUatRecord(id);
            if (StringUtils.hasText(request.getUatNo())) {
                entity.setUatNo(request.getUatNo());
            }
            if (StringUtils.hasText(request.getUatStatus())) {
                entity.setUatStatus(request.getUatStatus());
            }
            if (request.getIssueCount() != null) {
                entity.setIssueCount(request.getIssueCount());
            }
            if (request.getBlockerCount() != null) {
                entity.setBlockerCount(request.getBlockerCount());
            }
        }
        entity.setDept(request.getDept());
        entity.setSceneName(request.getSceneName());
        entity.setScenarioRef(request.getScenarioRef());
        entity.setOwnerDept(request.getOwnerDept());
        entity.setParticipant(request.getParticipant());
        entity.setExpected(request.getExpected());
        entity.setActual(request.getActual());
        entity.setConclusion(request.getConclusion());
        entity.setUatTime(parseTimestamp(request.getUatTime()));
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
        requireUatRecord(id);
        mapper.deleteById(id);
    }

    /** 登记验收结论：验收状态为空时默认 PASSED，回写验收时间。 */
    @Transactional
    public OaUatRecord conclude(Long id, String uatStatus, String conclusion) {
        OaUatRecord entity = requireUatRecord(id);
        entity.setUatStatus(StringUtils.hasText(uatStatus) ? uatStatus : STATUS_PASSED);
        entity.setConclusion(conclusion);
        entity.setUatTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 用户验收统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("passed", mapper.selectCount(Wrappers.<OaUatRecord>lambdaQuery()
                .eq(OaUatRecord::getUatStatus, STATUS_PASSED)));
        result.put("failed", mapper.selectCount(Wrappers.<OaUatRecord>lambdaQuery()
                .eq(OaUatRecord::getUatStatus, "FAILED")));
        result.put("running", mapper.selectCount(Wrappers.<OaUatRecord>lambdaQuery()
                .eq(OaUatRecord::getUatStatus, "RUNNING")));
        result.put("pending", mapper.selectCount(Wrappers.<OaUatRecord>lambdaQuery()
                .eq(OaUatRecord::getUatStatus, STATUS_PENDING)));
        long blockerTotal = 0L;
        for (OaUatRecord record : mapper.selectList(null)) {
            blockerTotal += record.getBlockerCount() == null ? 0 : record.getBlockerCount();
        }
        result.put("blockerTotal", blockerTotal);
        result.put("passRateThreshold", flowSupport.configInt("oa.uat.pass.rate", 95));
        return result;
    }

    public OaUatRecord requireUatRecord(Long id) {
        OaUatRecord entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "用户验收记录不存在: " + id);
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
