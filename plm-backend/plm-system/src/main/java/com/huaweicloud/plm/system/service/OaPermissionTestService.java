package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OaPermissionTestSaveRequest;
import com.huaweicloud.plm.system.dto.OaTestQuery;
import com.huaweicloud.plm.system.entity.OaPermissionTest;
import com.huaweicloud.plm.system.mapper.OaPermissionTestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 角色与数据隔离测试（OA-DEV-106）：跨部门/跨工厂场景验证、数据隔离结论与统计。
 * 场景类型与测试结论均为可配置数据，便于按权限验收范围调整。
 */
@Service
@RequiredArgsConstructor
public class OaPermissionTestService {

    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaPermissionTestMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaPermissionTest> pagePermissionTests(OaTestQuery query) {
        Page<OaPermissionTest> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaPermissionTest>lambdaQuery()
                .eq(StringUtils.hasText(query.getSceneType()), OaPermissionTest::getSceneType, query.getSceneType())
                .eq(StringUtils.hasText(query.getResult()), OaPermissionTest::getResult, query.getResult())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaPermissionTest::getTestNo, query.getKeyword()).or()
                        .like(OaPermissionTest::getSceneName, query.getKeyword()).or()
                        .like(OaPermissionTest::getRoleName, query.getKeyword()))
                .orderByDesc(OaPermissionTest::getId));
        return PageResult.of(page);
    }

    public OaPermissionTest detailPermissionTest(Long id) {
        return requirePermissionTest(id);
    }

    @Transactional
    public Long savePermissionTest(Long id, OaPermissionTestSaveRequest request) {
        OaPermissionTest entity;
        if (id == null) {
            entity = new OaPermissionTest();
            entity.setTestNo(StringUtils.hasText(request.getTestNo())
                    ? request.getTestNo() : flowSupport.nextBizNo("PT"));
            entity.setOrgId(currentOrgId());
        } else {
            entity = requirePermissionTest(id);
            if (StringUtils.hasText(request.getTestNo())) {
                entity.setTestNo(request.getTestNo());
            }
        }
        entity.setSceneName(request.getSceneName());
        entity.setSceneType(StringUtils.hasText(request.getSceneType()) ? request.getSceneType() : "CROSS_DEPT");
        entity.setRoleName(request.getRoleName());
        entity.setSubject(request.getSubject());
        entity.setDataScope(request.getDataScope());
        entity.setExpectedResult(request.getExpectedResult());
        entity.setActualResult(request.getActualResult());
        entity.setIsolationPass(request.getIsolationPass() == null ? 0 : request.getIsolationPass());
        entity.setResult(StringUtils.hasText(request.getResult()) ? request.getResult() : "PENDING");
        entity.setDefectNo(request.getDefectNo());
        entity.setTester(request.getTester());
        entity.setTestTime(parseTimestamp(request.getTestTime()));
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 回写隔离测试结论与测试时间。 */
    @Transactional
    public OaPermissionTest evaluate(Long id, String result, Boolean isolationPass) {
        OaPermissionTest entity = requirePermissionTest(id);
        entity.setResult(StringUtils.hasText(result) ? result : "PASS");
        if (isolationPass != null) {
            entity.setIsolationPass(Boolean.TRUE.equals(isolationPass) ? 1 : 0);
        }
        entity.setTestTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    @Transactional
    public void deletePermissionTest(Long id) {
        requirePermissionTest(id);
        mapper.deleteById(id);
    }

    /** 隔离测试统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("pass", mapper.selectCount(Wrappers.<OaPermissionTest>lambdaQuery()
                .eq(OaPermissionTest::getResult, "PASS")));
        result.put("fail", mapper.selectCount(Wrappers.<OaPermissionTest>lambdaQuery()
                .eq(OaPermissionTest::getResult, "FAIL")));
        result.put("pending", mapper.selectCount(Wrappers.<OaPermissionTest>lambdaQuery()
                .eq(OaPermissionTest::getResult, "PENDING")));
        result.put("crossDept", mapper.selectCount(Wrappers.<OaPermissionTest>lambdaQuery()
                .eq(OaPermissionTest::getSceneType, "CROSS_DEPT")));
        result.put("crossFactory", mapper.selectCount(Wrappers.<OaPermissionTest>lambdaQuery()
                .eq(OaPermissionTest::getSceneType, "CROSS_FACTORY")));
        result.put("isolationPassCount", mapper.selectCount(Wrappers.<OaPermissionTest>lambdaQuery()
                .eq(OaPermissionTest::getIsolationPass, 1)));
        return result;
    }

    public OaPermissionTest requirePermissionTest(Long id) {
        OaPermissionTest entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "权限测试不存在: " + id);
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
