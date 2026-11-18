package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OaGoliveQuery;
import com.huaweicloud.plm.system.dto.OaRollbackRecordSaveRequest;
import com.huaweicloud.plm.system.entity.OaRollbackRecord;
import com.huaweicloud.plm.system.mapper.OaRollbackRecordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 回退决策和演练（OA-DEV-118）：回退类型、触发条件、回退范围、数据边界、决策与演练结果维护。
 * 回退窗口时长与双写规避默认值为可配置项，便于按上线计划调整。
 */
@Service
@RequiredArgsConstructor
public class OaRollbackRecordService {

    private static final String TYPE_DECISION = "DECISION";
    private static final String DECISION_PENDING = "PENDING";
    private static final String DECISION_GO = "GO";
    private static final String DECISION_ROLLBACK = "ROLLBACK";
    private static final String DRILL_NOT_RUN = "NOT_RUN";
    private static final String DRILL_PASS = "PASS";
    private static final String DRILL_FAIL = "FAIL";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaRollbackRecordMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaRollbackRecord> pageRecords(OaGoliveQuery query) {
        Page<OaRollbackRecord> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaRollbackRecord>lambdaQuery()
                .eq(StringUtils.hasText(query.getRollbackType()), OaRollbackRecord::getRollbackType, query.getRollbackType())
                .eq(StringUtils.hasText(query.getDecisionResult()), OaRollbackRecord::getDecisionResult, query.getDecisionResult())
                .eq(StringUtils.hasText(query.getDrillResult()), OaRollbackRecord::getDrillResult, query.getDrillResult())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaRollbackRecord::getRollbackNo, query.getKeyword()).or()
                        .like(OaRollbackRecord::getRollbackName, query.getKeyword()).or()
                        .like(OaRollbackRecord::getRollbackOwner, query.getKeyword()))
                .orderByDesc(OaRollbackRecord::getId));
        return PageResult.of(page);
    }

    public OaRollbackRecord detail(Long id) {
        return requireRecord(id);
    }

    @Transactional
    public Long save(Long id, OaRollbackRecordSaveRequest request) {
        OaRollbackRecord entity;
        if (id == null) {
            entity = new OaRollbackRecord();
            entity.setRollbackNo(StringUtils.hasText(request.getRollbackNo())
                    ? request.getRollbackNo() : flowSupport.nextBizNo("RB"));
            entity.setRollbackType(StringUtils.hasText(request.getRollbackType())
                    ? request.getRollbackType() : TYPE_DECISION);
            entity.setDecisionResult(StringUtils.hasText(request.getDecisionResult())
                    ? request.getDecisionResult() : DECISION_PENDING);
            entity.setDrillResult(StringUtils.hasText(request.getDrillResult())
                    ? request.getDrillResult() : DRILL_NOT_RUN);
            entity.setWindowMinutes(flowSupport.configInt("oa.rollback.window.minutes", 120));
            entity.setDoubleWriteAvoided(1);
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireRecord(id);
            if (StringUtils.hasText(request.getRollbackNo())) {
                entity.setRollbackNo(request.getRollbackNo());
            }
            if (StringUtils.hasText(request.getRollbackType())) {
                entity.setRollbackType(request.getRollbackType());
            }
            if (StringUtils.hasText(request.getDecisionResult())) {
                entity.setDecisionResult(request.getDecisionResult());
            }
            if (StringUtils.hasText(request.getDrillResult())) {
                entity.setDrillResult(request.getDrillResult());
            }
        }
        entity.setRollbackName(request.getRollbackName());
        entity.setRollbackReason(request.getRollbackReason());
        entity.setTriggerCondition(request.getTriggerCondition());
        entity.setRollbackScope(request.getRollbackScope());
        entity.setDataBoundary(request.getDataBoundary());
        entity.setDecisionTime(parseTimestamp(request.getDecisionTime()));
        entity.setDrillTime(parseTimestamp(request.getDrillTime()));
        if (request.getWindowMinutes() != null) {
            entity.setWindowMinutes(request.getWindowMinutes());
        }
        if (request.getDoubleWriteAvoided() != null) {
            entity.setDoubleWriteAvoided(request.getDoubleWriteAvoided());
        }
        entity.setRollbackOwner(request.getRollbackOwner());
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
        requireRecord(id);
        mapper.deleteById(id);
    }

    /** 登记回退决策：决策结果为空时默认 GO，回写决策时间。 */
    @Transactional
    public OaRollbackRecord decide(Long id, String decisionResult) {
        OaRollbackRecord entity = requireRecord(id);
        entity.setDecisionResult(StringUtils.hasText(decisionResult) ? decisionResult : DECISION_GO);
        entity.setDecisionTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 登记回退演练：演练结果为空时默认 PASS，回写演练时间。 */
    @Transactional
    public OaRollbackRecord drill(Long id, String drillResult) {
        OaRollbackRecord entity = requireRecord(id);
        entity.setDrillResult(StringUtils.hasText(drillResult) ? drillResult : DRILL_PASS);
        entity.setDrillTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 回退决策和演练统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("pending", mapper.selectCount(Wrappers.<OaRollbackRecord>lambdaQuery()
                .eq(OaRollbackRecord::getDecisionResult, DECISION_PENDING)));
        result.put("goCount", mapper.selectCount(Wrappers.<OaRollbackRecord>lambdaQuery()
                .eq(OaRollbackRecord::getDecisionResult, DECISION_GO)));
        result.put("rollbackCount", mapper.selectCount(Wrappers.<OaRollbackRecord>lambdaQuery()
                .eq(OaRollbackRecord::getDecisionResult, DECISION_ROLLBACK)));
        result.put("drillPass", mapper.selectCount(Wrappers.<OaRollbackRecord>lambdaQuery()
                .eq(OaRollbackRecord::getDrillResult, DRILL_PASS)));
        result.put("drillFail", mapper.selectCount(Wrappers.<OaRollbackRecord>lambdaQuery()
                .eq(OaRollbackRecord::getDrillResult, DRILL_FAIL)));
        result.put("doubleWriteAvoidedCount", mapper.selectCount(Wrappers.<OaRollbackRecord>lambdaQuery()
                .eq(OaRollbackRecord::getDoubleWriteAvoided, 1)));
        result.put("rollbackWindowMinutes", flowSupport.configInt("oa.rollback.window.minutes", 120));
        return result;
    }

    public OaRollbackRecord requireRecord(Long id) {
        OaRollbackRecord entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "回退记录不存在: " + id);
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
