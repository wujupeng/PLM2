package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OaCompatTestSaveRequest;
import com.huaweicloud.plm.system.dto.OaTestQuery;
import com.huaweicloud.plm.system.entity.OaCompatTest;
import com.huaweicloud.plm.system.mapper.OaCompatTestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 兼容性测试（OA-DEV-109）：浏览器/终端环境、网络条件测试记录与结论评定。
 * 兼容浏览器清单为可配置项，便于按验收范围调整。
 */
@Service
@RequiredArgsConstructor
public class OaCompatTestService {

    private static final String RESULT_PASS = "PASS";
    private static final String RESULT_PARTIAL = "PARTIAL";
    private static final String RESULT_FAIL = "FAIL";
    private static final String RESULT_PENDING = "PENDING";
    private static final String BLOCK_LEVEL_BLOCKER = "BLOCKER";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaCompatTestMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaCompatTest> pageCompatTests(OaTestQuery query) {
        Page<OaCompatTest> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaCompatTest>lambdaQuery()
                .eq(StringUtils.hasText(query.getEnvType()), OaCompatTest::getEnvType, query.getEnvType())
                .eq(StringUtils.hasText(query.getResult()), OaCompatTest::getResult, query.getResult())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaCompatTest::getTestNo, query.getKeyword()).or()
                        .like(OaCompatTest::getEnvName, query.getKeyword()))
                .orderByDesc(OaCompatTest::getId));
        return PageResult.of(page);
    }

    public OaCompatTest detail(Long id) {
        return requireCompatTest(id);
    }

    @Transactional
    public Long save(Long id, OaCompatTestSaveRequest request) {
        OaCompatTest entity;
        if (id == null) {
            entity = new OaCompatTest();
            entity.setTestNo(StringUtils.hasText(request.getTestNo())
                    ? request.getTestNo() : flowSupport.nextBizNo("CT"));
            entity.setEnvType(StringUtils.hasText(request.getEnvType()) ? request.getEnvType() : "BROWSER");
            entity.setResult(StringUtils.hasText(request.getResult()) ? request.getResult() : RESULT_PENDING);
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireCompatTest(id);
            if (StringUtils.hasText(request.getTestNo())) {
                entity.setTestNo(request.getTestNo());
            }
        }
        entity.setEnvName(request.getEnvName());
        entity.setEnvVersion(request.getEnvVersion());
        entity.setNetwork(request.getNetwork());
        entity.setScene(request.getScene());
        if (StringUtils.hasText(request.getResult())) {
            entity.setResult(request.getResult());
        }
        entity.setBlockLevel(request.getBlockLevel());
        entity.setIssue(request.getIssue());
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

    @Transactional
    public void delete(Long id) {
        requireCompatTest(id);
        mapper.deleteById(id);
    }

    /** 评定兼容性测试结论，并记录测试时间。 */
    @Transactional
    public OaCompatTest evaluate(Long id, String result) {
        OaCompatTest entity = requireCompatTest(id);
        entity.setResult(StringUtils.hasText(result) ? result : RESULT_PASS);
        entity.setTestTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 兼容性测试统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("pass", mapper.selectCount(Wrappers.<OaCompatTest>lambdaQuery()
                .eq(OaCompatTest::getResult, RESULT_PASS)));
        result.put("partial", mapper.selectCount(Wrappers.<OaCompatTest>lambdaQuery()
                .eq(OaCompatTest::getResult, RESULT_PARTIAL)));
        result.put("fail", mapper.selectCount(Wrappers.<OaCompatTest>lambdaQuery()
                .eq(OaCompatTest::getResult, RESULT_FAIL)));
        result.put("pending", mapper.selectCount(Wrappers.<OaCompatTest>lambdaQuery()
                .eq(OaCompatTest::getResult, RESULT_PENDING)));
        result.put("blockerCount", mapper.selectCount(Wrappers.<OaCompatTest>lambdaQuery()
                .eq(OaCompatTest::getBlockLevel, BLOCK_LEVEL_BLOCKER)));
        result.put("compatBrowsers", flowSupport.configString("oa.compat.browsers", ""));
        return result;
    }

    public OaCompatTest requireCompatTest(Long id) {
        OaCompatTest entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "兼容性测试不存在: " + id);
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
