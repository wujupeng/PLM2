package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.IntPerfTestQuery;
import com.huaweicloud.plm.system.dto.IntPerfTestSaveRequest;
import com.huaweicloud.plm.system.entity.IntPerfTest;
import com.huaweicloud.plm.system.mapper.IntPerfTestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** 性能测试服务（N9，DEV-101）。 */
@Service
@RequiredArgsConstructor
public class IntPerfTestService {

    private final IntPerfTestMapper perfTestMapper;
    private final IntSupportService intSupport;

    /**
     * 分页查询性能测试。
     */
    public PageResult<IntPerfTest> page(IntPerfTestQuery query) {
        Page<IntPerfTest> page = query.toPage();
        perfTestMapper.selectPage(page, Wrappers.<IntPerfTest>lambdaQuery()
                .eq(StringUtils.hasText(query.getTestNo()), IntPerfTest::getTestNo, query.getTestNo())
                .eq(StringUtils.hasText(query.getScenario()), IntPerfTest::getScenario, query.getScenario())
                .eq(StringUtils.hasText(query.getResult()), IntPerfTest::getResult, query.getResult())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(IntPerfTest::getTestNo, query.getKeyword()).or()
                        .like(IntPerfTest::getScenario, query.getKeyword()).or()
                        .like(IntPerfTest::getReportPath, query.getKeyword()))
                .orderByDesc(IntPerfTest::getId));
        return PageResult.of(page);
    }

    /**
     * 按测试编号获取性能测试，不存在时抛出业务异常。
     */
    public IntPerfTest require(String testNo) {
        IntPerfTest entity = perfTestMapper.selectOne(Wrappers.<IntPerfTest>lambdaQuery()
                .eq(IntPerfTest::getTestNo, testNo));
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "性能测试不存在: " + testNo);
        }
        return entity;
    }

    /**
     * 新增性能测试，返回测试编号。
     */
    public String create(IntPerfTestSaveRequest request) {
        IntPerfTest entity = new IntPerfTest();
        entity.setTestNo(StringUtils.hasText(request.getTestNo())
                ? request.getTestNo() : intSupport.nextNo("PT"));
        applyFields(entity, request);
        if (!StringUtils.hasText(entity.getResult())) {
            entity.setResult("PASS");
        }
        if (entity.getTestAt() == null) {
            entity.setTestAt(LocalDateTime.now());
        }
        perfTestMapper.insert(entity);
        return entity.getTestNo();
    }

    /**
     * 更新性能测试。
     */
    public void update(String testNo, IntPerfTestSaveRequest request) {
        IntPerfTest entity = require(testNo);
        applyFields(entity, request);
        perfTestMapper.updateById(entity);
    }

    /**
     * 删除性能测试。
     */
    public void delete(String testNo) {
        IntPerfTest entity = require(testNo);
        perfTestMapper.deleteById(entity.getId());
    }

    /**
     * 按配置目标判定性能测试是否达标：目标或实测为空视为该项通过。
     */
    public IntPerfTest evaluate(String testNo) {
        IntPerfTest entity = require(testNo);
        BigDecimal targetRps = entity.getTargetRps() != null
                ? entity.getTargetRps() : intSupport.configDecimal("int.perf.target.rps", null);
        BigDecimal targetP95 = entity.getTargetP95Ms() != null
                ? entity.getTargetP95Ms() : intSupport.configDecimal("int.perf.target.p95.ms", null);
        boolean rpsPass = targetRps == null || entity.getActualRps() == null
                || entity.getActualRps().compareTo(targetRps) >= 0;
        boolean p95Pass = targetP95 == null || entity.getActualP95Ms() == null
                || entity.getActualP95Ms().compareTo(targetP95) <= 0;
        entity.setResult(rpsPass && p95Pass ? "PASS" : "FAIL");
        perfTestMapper.updateById(entity);
        return entity;
    }

    /**
     * 将请求字段写入实体。
     */
    private void applyFields(IntPerfTest entity, IntPerfTestSaveRequest request) {
        entity.setScenario(request.getScenario());
        entity.setTargetRps(request.getTargetRps());
        entity.setTargetP95Ms(request.getTargetP95Ms());
        entity.setActualRps(request.getActualRps());
        entity.setActualP95Ms(request.getActualP95Ms());
        entity.setConcurrency(request.getConcurrency());
        entity.setDurationSec(request.getDurationSec());
        entity.setReportPath(request.getReportPath());
        entity.setRemark(request.getRemark());
    }
}
