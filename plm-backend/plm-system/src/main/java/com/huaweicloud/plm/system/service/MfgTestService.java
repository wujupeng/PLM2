package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.MfgTestQuery;
import com.huaweicloud.plm.system.dto.MfgTestSaveRequest;
import com.huaweicloud.plm.system.entity.MfgTestResult;
import com.huaweicloud.plm.system.mapper.MfgTestResultMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 关键参数与测试结果服务（N8，DEV-087）：采集电气、尺寸、装配、焊接、点胶灌封等检验/工艺数据。
 * 未明确填写结果时，按配置 mfg.test.auto.judge 依据上下限自动判定。
 */
@Service
@RequiredArgsConstructor
public class MfgTestService {

    private static final String RESULT_OK = "OK";
    private static final String RESULT_NG = "NG";
    private static final String DEFAULT_TEST_TYPE = "ELECTRICAL";

    private final MfgTestResultMapper mfgTestResultMapper;
    private final MfgSupportService mfgSupport;

    public PageResult<MfgTestResult> page(MfgTestQuery query) {
        Page<MfgTestResult> page = query.toPage();
        mfgTestResultMapper.selectPage(page, Wrappers.<MfgTestResult>lambdaQuery()
                .eq(StringUtils.hasText(query.getResultNo()), MfgTestResult::getResultNo, query.getResultNo())
                .eq(StringUtils.hasText(query.getBatchNo()), MfgTestResult::getBatchNo, query.getBatchNo())
                .eq(StringUtils.hasText(query.getSerialNo()), MfgTestResult::getSerialNo, query.getSerialNo())
                .eq(StringUtils.hasText(query.getTestType()), MfgTestResult::getTestType, query.getTestType())
                .eq(StringUtils.hasText(query.getResult()), MfgTestResult::getResult, query.getResult())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(MfgTestResult::getResultNo, query.getKeyword()).or()
                        .like(MfgTestResult::getBatchNo, query.getKeyword()).or()
                        .like(MfgTestResult::getSerialNo, query.getKeyword()).or()
                        .like(MfgTestResult::getTestItemName, query.getKeyword()))
                .orderByDesc(MfgTestResult::getId));
        return PageResult.of(page);
    }

    public List<MfgTestResult> listByBatch(String batchNo) {
        return mfgTestResultMapper.selectList(Wrappers.<MfgTestResult>lambdaQuery()
                .eq(MfgTestResult::getBatchNo, batchNo)
                .orderByAsc(MfgTestResult::getId));
    }

    public MfgTestResult require(Long id) {
        MfgTestResult result = mfgTestResultMapper.selectById(id);
        if (result == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "测试结果不存在: " + id);
        }
        return result;
    }

    public Long create(MfgTestSaveRequest request) {
        String resultNo = StringUtils.hasText(request.getResultNo())
                ? request.getResultNo() : mfgSupport.nextNo("TR");
        MfgTestResult result = new MfgTestResult();
        result.setResultNo(resultNo);
        applyFields(result, request);
        mfgTestResultMapper.insert(result);
        return result.getId();
    }

    public void update(Long id, MfgTestSaveRequest request) {
        MfgTestResult result = require(id);
        applyFields(result, request);
        mfgTestResultMapper.updateById(result);
    }

    public void delete(Long id) {
        require(id);
        mfgTestResultMapper.deleteById(id);
    }

    private void applyFields(MfgTestResult result, MfgTestSaveRequest request) {
        result.setBatchNo(request.getBatchNo());
        result.setSerialNo(request.getSerialNo());
        result.setProductCode(request.getProductCode());
        result.setOperationCode(request.getOperationCode());
        result.setOperationName(request.getOperationName());
        result.setTestType(StringUtils.hasText(request.getTestType())
                ? request.getTestType() : DEFAULT_TEST_TYPE);
        result.setTestItemCode(request.getTestItemCode());
        result.setTestItemName(request.getTestItemName());
        result.setStandardValue(request.getStandardValue());
        result.setLowerLimit(request.getLowerLimit());
        result.setUpperLimit(request.getUpperLimit());
        result.setActualValue(request.getActualValue());
        result.setActualText(request.getActualText());
        result.setUnit(request.getUnit());
        result.setResult(resolveResult(request));
        result.setEquipmentCode(request.getEquipmentCode());
        result.setTester(request.getTester());
        result.setTestedAt(request.getTestedAt() != null ? request.getTestedAt() : LocalDateTime.now());
        result.setSourceSystem(request.getSourceSystem());
        result.setAttachmentUrl(request.getAttachmentUrl());
        result.setRemark(request.getRemark());
    }

    /**
     * 结果判定：显式填写则采用；否则在启用自动判定且实测值与上下限齐备时按区间判定。
     */
    private String resolveResult(MfgTestSaveRequest request) {
        if (StringUtils.hasText(request.getResult())) {
            return request.getResult();
        }
        boolean autoJudge = mfgSupport.configBool("mfg.test.auto.judge", true);
        BigDecimal actual = request.getActualValue();
        if (!autoJudge || actual == null) {
            return RESULT_OK;
        }
        if (request.getLowerLimit() != null && actual.compareTo(request.getLowerLimit()) < 0) {
            return RESULT_NG;
        }
        if (request.getUpperLimit() != null && actual.compareTo(request.getUpperLimit()) > 0) {
            return RESULT_NG;
        }
        return RESULT_OK;
    }
}
