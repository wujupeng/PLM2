package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IntTestCaseQuery;
import com.huaweicloud.plm.system.dto.IntTestCaseRunRequest;
import com.huaweicloud.plm.system.dto.IntTestCaseSaveRequest;
import com.huaweicloud.plm.system.entity.IntTestCase;
import com.huaweicloud.plm.system.mapper.IntTestCaseMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/** 测试用例服务（N9，DEV-100）。 */
@Service
@RequiredArgsConstructor
public class IntTestCaseService {

    private final IntTestCaseMapper testCaseMapper;
    private final IntSupportService intSupport;

    /**
     * 分页查询测试用例。
     */
    public PageResult<IntTestCase> page(IntTestCaseQuery query) {
        Page<IntTestCase> page = query.toPage();
        testCaseMapper.selectPage(page, Wrappers.<IntTestCase>lambdaQuery()
                .eq(StringUtils.hasText(query.getCaseNo()), IntTestCase::getCaseNo, query.getCaseNo())
                .eq(StringUtils.hasText(query.getCaseType()), IntTestCase::getCaseType, query.getCaseType())
                .eq(StringUtils.hasText(query.getRelatedNode()), IntTestCase::getRelatedNode, query.getRelatedNode())
                .eq(StringUtils.hasText(query.getPriority()), IntTestCase::getPriority, query.getPriority())
                .eq(StringUtils.hasText(query.getRunStatus()), IntTestCase::getRunStatus, query.getRunStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(IntTestCase::getCaseNo, query.getKeyword()).or()
                        .like(IntTestCase::getTitle, query.getKeyword()))
                .orderByDesc(IntTestCase::getId));
        return PageResult.of(page);
    }

    /**
     * 按用例编号获取测试用例，不存在时抛出业务异常。
     */
    public IntTestCase require(String caseNo) {
        IntTestCase entity = testCaseMapper.selectOne(Wrappers.<IntTestCase>lambdaQuery()
                .eq(IntTestCase::getCaseNo, caseNo));
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "测试用例不存在: " + caseNo);
        }
        return entity;
    }

    /**
     * 新增测试用例，返回用例编号。
     */
    public String create(IntTestCaseSaveRequest request) {
        IntTestCase entity = new IntTestCase();
        entity.setCaseNo(StringUtils.hasText(request.getCaseNo())
                ? request.getCaseNo() : intSupport.nextNo("TC"));
        applyFields(entity, request);
        if (!StringUtils.hasText(entity.getPriority())) {
            entity.setPriority("P1");
        }
        if (!StringUtils.hasText(entity.getRunStatus())) {
            entity.setRunStatus("NOT_RUN");
        }
        testCaseMapper.insert(entity);
        return entity.getCaseNo();
    }

    /**
     * 更新测试用例。
     */
    public void update(String caseNo, IntTestCaseSaveRequest request) {
        IntTestCase entity = require(caseNo);
        applyFields(entity, request);
        testCaseMapper.updateById(entity);
    }

    /**
     * 删除测试用例。
     */
    public void delete(String caseNo) {
        IntTestCase entity = require(caseNo);
        testCaseMapper.deleteById(entity.getId());
    }

    /**
     * 执行测试用例：记录执行状态、结果、缺陷、执行人与执行时间。
     */
    public IntTestCase run(String caseNo, IntTestCaseRunRequest request) {
        IntTestCase entity = require(caseNo);
        entity.setRunStatus(request.getRunStatus());
        entity.setRunResult(request.getRunResult());
        entity.setDefectNo(request.getDefectNo());
        entity.setRunner(UserContext.getUsername());
        entity.setRunAt(LocalDateTime.now());
        testCaseMapper.updateById(entity);
        return entity;
    }

    /**
     * 将请求字段写入实体。
     */
    private void applyFields(IntTestCase entity, IntTestCaseSaveRequest request) {
        entity.setCaseType(request.getCaseType());
        entity.setRelatedNode(request.getRelatedNode());
        entity.setTitle(request.getTitle());
        entity.setPrecondition(request.getPrecondition());
        entity.setSteps(request.getSteps());
        entity.setExpected(request.getExpected());
        entity.setPriority(request.getPriority());
        entity.setRemark(request.getRemark());
    }
}
