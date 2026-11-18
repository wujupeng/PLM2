package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OaCutoverPlanSaveRequest;
import com.huaweicloud.plm.system.dto.OaTestQuery;
import com.huaweicloud.plm.system.entity.OaCutoverPlan;
import com.huaweicloud.plm.system.mapper.OaCutoverPlanMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 上线切换与回退预案（OA-DEV-113）：切换窗口、冻结时间、增量同步、入口切换、通知方案与回退预案维护。
 * 切换窗口与回退窗口时长均为可配置项，便于按上线计划调整。
 */
@Service
@RequiredArgsConstructor
public class OaCutoverPlanService {

    private static final String TYPE_CUTOVER = "CUTOVER";
    private static final String TYPE_ROLLBACK = "ROLLBACK";
    private static final String STATUS_DRAFT = "DRAFT";
    private static final String STATUS_APPROVED = "APPROVED";
    private static final String REHEARSAL_NOT_RUN = "NOT_RUN";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaCutoverPlanMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaCutoverPlan> pageCutoverPlans(OaTestQuery query) {
        Page<OaCutoverPlan> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaCutoverPlan>lambdaQuery()
                .eq(StringUtils.hasText(query.getPlanType()), OaCutoverPlan::getPlanType, query.getPlanType())
                .eq(StringUtils.hasText(query.getCutoverStatus()), OaCutoverPlan::getStatus, query.getCutoverStatus())
                .eq(StringUtils.hasText(query.getRehearsalResult()), OaCutoverPlan::getRehearsalResult, query.getRehearsalResult())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaCutoverPlan::getPlanNo, query.getKeyword()).or()
                        .like(OaCutoverPlan::getPlanName, query.getKeyword()))
                .orderByDesc(OaCutoverPlan::getId));
        return PageResult.of(page);
    }

    public OaCutoverPlan detail(Long id) {
        return requirePlan(id);
    }

    @Transactional
    public Long save(Long id, OaCutoverPlanSaveRequest request) {
        OaCutoverPlan entity;
        if (id == null) {
            entity = new OaCutoverPlan();
            entity.setPlanNo(StringUtils.hasText(request.getPlanNo())
                    ? request.getPlanNo() : flowSupport.nextBizNo("CP"));
            entity.setPlanType(StringUtils.hasText(request.getPlanType()) ? request.getPlanType() : TYPE_CUTOVER);
            entity.setRehearsalResult(StringUtils.hasText(request.getRehearsalResult())
                    ? request.getRehearsalResult() : REHEARSAL_NOT_RUN);
            entity.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus() : STATUS_DRAFT);
            entity.setOrgId(currentOrgId());
        } else {
            entity = requirePlan(id);
            if (StringUtils.hasText(request.getPlanNo())) {
                entity.setPlanNo(request.getPlanNo());
            }
            if (StringUtils.hasText(request.getPlanType())) {
                entity.setPlanType(request.getPlanType());
            }
            if (StringUtils.hasText(request.getRehearsalResult())) {
                entity.setRehearsalResult(request.getRehearsalResult());
            }
            if (StringUtils.hasText(request.getStatus())) {
                entity.setStatus(request.getStatus());
            }
        }
        entity.setPlanName(request.getPlanName());
        entity.setCutoverWindow(request.getCutoverWindow());
        entity.setFreezeTime(parseTimestamp(request.getFreezeTime()));
        entity.setIncrementSync(request.getIncrementSync());
        entity.setEntrySwitch(request.getEntrySwitch());
        entity.setNotifyPlan(request.getNotifyPlan());
        entity.setDutyPerson(request.getDutyPerson());
        entity.setRollbackTrigger(request.getRollbackTrigger());
        entity.setRollbackOwner(request.getRollbackOwner());
        entity.setRehearsalTime(parseTimestamp(request.getRehearsalTime()));
        entity.setApprover(request.getApprover());
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
        requirePlan(id);
        mapper.deleteById(id);
    }

    /** 登记演练结果：演练结果为空时默认 PASS，回写演练时间。 */
    @Transactional
    public OaCutoverPlan rehearse(Long id, String rehearsalResult) {
        OaCutoverPlan entity = requirePlan(id);
        entity.setRehearsalResult(StringUtils.hasText(rehearsalResult) ? rehearsalResult : "PASS");
        entity.setRehearsalTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 批准预案：已批准时不可重复审批。 */
    @Transactional
    public OaCutoverPlan approve(Long id, String approver) {
        OaCutoverPlan entity = requirePlan(id);
        if (STATUS_APPROVED.equals(entity.getStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "预案已批准，无需重复审批");
        }
        entity.setStatus(STATUS_APPROVED);
        if (StringUtils.hasText(approver)) {
            entity.setApprover(approver);
        }
        mapper.updateById(entity);
        return entity;
    }

    /** 上线切换与回退预案统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("cutover", mapper.selectCount(Wrappers.<OaCutoverPlan>lambdaQuery()
                .eq(OaCutoverPlan::getPlanType, TYPE_CUTOVER)));
        result.put("rollback", mapper.selectCount(Wrappers.<OaCutoverPlan>lambdaQuery()
                .eq(OaCutoverPlan::getPlanType, TYPE_ROLLBACK)));
        result.put("draft", mapper.selectCount(Wrappers.<OaCutoverPlan>lambdaQuery()
                .eq(OaCutoverPlan::getStatus, STATUS_DRAFT)));
        result.put("reviewed", mapper.selectCount(Wrappers.<OaCutoverPlan>lambdaQuery()
                .eq(OaCutoverPlan::getStatus, "REVIEWED")));
        result.put("approved", mapper.selectCount(Wrappers.<OaCutoverPlan>lambdaQuery()
                .eq(OaCutoverPlan::getStatus, STATUS_APPROVED)));
        result.put("rehearsalPass", mapper.selectCount(Wrappers.<OaCutoverPlan>lambdaQuery()
                .eq(OaCutoverPlan::getRehearsalResult, "PASS")));
        result.put("rehearsalFail", mapper.selectCount(Wrappers.<OaCutoverPlan>lambdaQuery()
                .eq(OaCutoverPlan::getRehearsalResult, "FAIL")));
        result.put("cutoverWindow", flowSupport.configString("oa.cutover.window", ""));
        result.put("rollbackWindowMinutes", flowSupport.configInt("oa.rollback.window.minutes", 120));
        return result;
    }

    public OaCutoverPlan requirePlan(Long id) {
        OaCutoverPlan entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "上线切换预案不存在: " + id);
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
