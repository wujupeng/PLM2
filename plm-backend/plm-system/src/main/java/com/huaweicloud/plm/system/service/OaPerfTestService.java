package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OaPerfTestSaveRequest;
import com.huaweicloud.plm.system.dto.OaTestQuery;
import com.huaweicloud.plm.system.entity.OaPerfTest;
import com.huaweicloud.plm.system.mapper.OaPerfTestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 性能与容量测试（OA-DEV-108）：压测场景负载模型、目标/实际指标维护与结论推导。
 * 目标并发数与目标响应时间为可配置项，便于按业务方验收口径调整。
 */
@Service
@RequiredArgsConstructor
public class OaPerfTestService {

    private static final String RESULT_PASS = "PASS";
    private static final String RESULT_FAIL = "FAIL";
    private static final String RESULT_PENDING = "PENDING";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaPerfTestMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaPerfTest> pagePerfTests(OaTestQuery query) {
        Page<OaPerfTest> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaPerfTest>lambdaQuery()
                .eq(StringUtils.hasText(query.getResult()), OaPerfTest::getResult, query.getResult())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaPerfTest::getTestNo, query.getKeyword()).or()
                        .like(OaPerfTest::getSceneName, query.getKeyword()))
                .orderByDesc(OaPerfTest::getId));
        return PageResult.of(page);
    }

    public OaPerfTest detail(Long id) {
        return requirePerfTest(id);
    }

    @Transactional
    public Long save(Long id, OaPerfTestSaveRequest request) {
        OaPerfTest entity;
        if (id == null) {
            entity = new OaPerfTest();
            entity.setTestNo(StringUtils.hasText(request.getTestNo())
                    ? request.getTestNo() : flowSupport.nextBizNo("PF"));
            entity.setResult(StringUtils.hasText(request.getResult()) ? request.getResult() : RESULT_PENDING);
            entity.setOrgId(currentOrgId());
        } else {
            entity = requirePerfTest(id);
            if (StringUtils.hasText(request.getTestNo())) {
                entity.setTestNo(request.getTestNo());
            }
        }
        entity.setSceneName(request.getSceneName());
        entity.setLoadModel(StringUtils.hasText(request.getLoadModel()) ? request.getLoadModel() : "CONSTANT");
        entity.setConcurrentUsers(request.getConcurrentUsers() == null ? 0 : request.getConcurrentUsers());
        entity.setFlowConcurrency(request.getFlowConcurrency() == null ? 0 : request.getFlowConcurrency());
        entity.setMailVolume(request.getMailVolume() == null ? 0L : request.getMailVolume());
        entity.setDocVolume(request.getDocVolume() == null ? 0L : request.getDocVolume());
        entity.setAttachCapacity(request.getAttachCapacity() == null ? 0L : request.getAttachCapacity());
        entity.setTargetTps(request.getTargetTps() == null ? 0 : request.getTargetTps());
        entity.setTargetRtMs(request.getTargetRtMs() == null ? 0 : request.getTargetRtMs());
        entity.setActualTps(request.getActualTps() == null ? 0 : request.getActualTps());
        entity.setActualRtMs(request.getActualRtMs() == null ? 0 : request.getActualRtMs());
        entity.setErrorRate(request.getErrorRate() == null ? BigDecimal.ZERO : request.getErrorRate());
        entity.setCpuUsage(request.getCpuUsage() == null ? BigDecimal.ZERO : request.getCpuUsage());
        entity.setMemUsage(request.getMemUsage() == null ? BigDecimal.ZERO : request.getMemUsage());
        if (StringUtils.hasText(request.getResult())) {
            entity.setResult(request.getResult());
        }
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
        requirePerfTest(id);
        mapper.deleteById(id);
    }

    /** 依据目标与实际指标推导测试结论，并记录测试时间。 */
    @Transactional
    public OaPerfTest conclude(Long id) {
        OaPerfTest entity = requirePerfTest(id);
        boolean tpsReached = entity.getTargetTps() != null && entity.getTargetTps() > 0
                && entity.getActualTps() != null && entity.getActualTps() >= entity.getTargetTps();
        boolean rtReached = entity.getTargetRtMs() == null || entity.getTargetRtMs() == 0
                || (entity.getActualRtMs() != null && entity.getActualRtMs() <= entity.getTargetRtMs());
        entity.setResult(tpsReached && rtReached ? RESULT_PASS : RESULT_FAIL);
        entity.setTestTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 性能测试统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("pass", mapper.selectCount(Wrappers.<OaPerfTest>lambdaQuery()
                .eq(OaPerfTest::getResult, RESULT_PASS)));
        result.put("fail", mapper.selectCount(Wrappers.<OaPerfTest>lambdaQuery()
                .eq(OaPerfTest::getResult, RESULT_FAIL)));
        result.put("pending", mapper.selectCount(Wrappers.<OaPerfTest>lambdaQuery()
                .eq(OaPerfTest::getResult, RESULT_PENDING)));
        result.put("targetConcurrentUsers", flowSupport.configInt("oa.perf.concurrent.users.target", 500));
        result.put("targetResponseMs", flowSupport.configInt("oa.perf.response.ms.target", 2000));
        return result;
    }

    public OaPerfTest requirePerfTest(Long id) {
        OaPerfTest entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "性能测试不存在: " + id);
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
