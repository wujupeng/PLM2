package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OaTestCaseSaveRequest;
import com.huaweicloud.plm.system.dto.OaTestQuery;
import com.huaweicloud.plm.system.entity.OaTestCase;
import com.huaweicloud.plm.system.mapper.OaTestCaseMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 功能与回归测试集（OA-DEV-105）：用例维护、执行回写与通过率统计。
 * 用例类型、优先级与执行状态均为可配置数据，便于按测试计划调整。
 */
@Service
@RequiredArgsConstructor
public class OaTestCaseService {

    private static final String EXEC_NOT_RUN = "NOT_RUN";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaTestCaseMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaTestCase> pageCases(OaTestQuery query) {
        Page<OaTestCase> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaTestCase>lambdaQuery()
                .eq(StringUtils.hasText(query.getModule()), OaTestCase::getModule, query.getModule())
                .eq(StringUtils.hasText(query.getCaseType()), OaTestCase::getCaseType, query.getCaseType())
                .eq(StringUtils.hasText(query.getPriority()), OaTestCase::getPriority, query.getPriority())
                .eq(StringUtils.hasText(query.getExecStatus()), OaTestCase::getExecStatus, query.getExecStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaTestCase::getCaseNo, query.getKeyword()).or()
                        .like(OaTestCase::getCaseName, query.getKeyword()).or()
                        .like(OaTestCase::getRequirementRef, query.getKeyword()))
                .orderByDesc(OaTestCase::getId));
        return PageResult.of(page);
    }

    public OaTestCase detailCase(Long id) {
        return requireCase(id);
    }

    @Transactional
    public Long saveCase(Long id, OaTestCaseSaveRequest request) {
        OaTestCase entity;
        if (id == null) {
            entity = new OaTestCase();
            entity.setCaseNo(StringUtils.hasText(request.getCaseNo())
                    ? request.getCaseNo() : flowSupport.nextBizNo("TC"));
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireCase(id);
            if (StringUtils.hasText(request.getCaseNo())) {
                entity.setCaseNo(request.getCaseNo());
            }
        }
        entity.setCaseName(request.getCaseName());
        entity.setModule(request.getModule());
        entity.setRequirementRef(request.getRequirementRef());
        entity.setPageRef(request.getPageRef());
        entity.setApiRef(request.getApiRef());
        entity.setTableRef(request.getTableRef());
        entity.setCaseType(StringUtils.hasText(request.getCaseType()) ? request.getCaseType() : "FUNCTION");
        entity.setPriority(StringUtils.hasText(request.getPriority()) ? request.getPriority() : "P1");
        entity.setPrecondition(request.getPrecondition());
        entity.setSteps(request.getSteps());
        entity.setExpected(request.getExpected());
        entity.setExecStatus(StringUtils.hasText(request.getExecStatus()) ? request.getExecStatus() : EXEC_NOT_RUN);
        entity.setTestResult(request.getTestResult());
        entity.setTester(request.getTester());
        entity.setLastRunTime(parseTimestamp(request.getLastRunTime()));
        entity.setStatus(request.getStatus() == null ? 1 : request.getStatus());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 回写用例执行结果与执行时间。 */
    @Transactional
    public OaTestCase executeCase(Long id, String execStatus, String testResult, String tester) {
        OaTestCase entity = requireCase(id);
        entity.setExecStatus(StringUtils.hasText(execStatus) ? execStatus : "PASS");
        entity.setTestResult(testResult);
        entity.setTester(tester);
        entity.setLastRunTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    @Transactional
    public void deleteCase(Long id) {
        requireCase(id);
        mapper.deleteById(id);
    }

    /** 测试执行统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("pass", mapper.selectCount(Wrappers.<OaTestCase>lambdaQuery()
                .eq(OaTestCase::getExecStatus, "PASS")));
        result.put("fail", mapper.selectCount(Wrappers.<OaTestCase>lambdaQuery()
                .eq(OaTestCase::getExecStatus, "FAIL")));
        result.put("blocked", mapper.selectCount(Wrappers.<OaTestCase>lambdaQuery()
                .eq(OaTestCase::getExecStatus, "BLOCKED")));
        result.put("notRun", mapper.selectCount(Wrappers.<OaTestCase>lambdaQuery()
                .eq(OaTestCase::getExecStatus, EXEC_NOT_RUN)));
        result.put("p0Case", mapper.selectCount(Wrappers.<OaTestCase>lambdaQuery()
                .eq(OaTestCase::getPriority, "P0")));
        result.put("p1Case", mapper.selectCount(Wrappers.<OaTestCase>lambdaQuery()
                .eq(OaTestCase::getPriority, "P1")));
        result.put("regressionCase", mapper.selectCount(Wrappers.<OaTestCase>lambdaQuery()
                .eq(OaTestCase::getCaseType, "REGRESSION")));
        result.put("blockerThreshold", flowSupport.configInt("oa.test.blocker.defect.threshold", 0));
        result.put("regressionEnabled", flowSupport.configBoolean("oa.test.regression.enabled", true));
        return result;
    }

    public OaTestCase requireCase(Long id) {
        OaTestCase entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "测试用例不存在: " + id);
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
