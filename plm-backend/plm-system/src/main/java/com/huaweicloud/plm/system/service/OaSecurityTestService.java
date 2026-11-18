package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OaSecurityTestSaveRequest;
import com.huaweicloud.plm.system.dto.OaTestQuery;
import com.huaweicloud.plm.system.entity.OaSecurityTest;
import com.huaweicloud.plm.system.mapper.OaSecurityTestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 安全测试（OA-DEV-107）：代码扫描/渗透/漏洞检查项维护、整改验证与风险统计。
 * 检查类型、风险级别与整改状态均为可配置数据，便于按安全验收要求调整。
 */
@Service
@RequiredArgsConstructor
public class OaSecurityTestService {

    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaSecurityTestMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaSecurityTest> pageSecurityTests(OaTestQuery query) {
        Page<OaSecurityTest> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaSecurityTest>lambdaQuery()
                .eq(StringUtils.hasText(query.getCheckType()), OaSecurityTest::getCheckType, query.getCheckType())
                .eq(StringUtils.hasText(query.getSeverity()), OaSecurityTest::getSeverity, query.getSeverity())
                .eq(StringUtils.hasText(query.getFixStatus()), OaSecurityTest::getFixStatus, query.getFixStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaSecurityTest::getScanNo, query.getKeyword()).or()
                        .like(OaSecurityTest::getCheckName, query.getKeyword()).or()
                        .like(OaSecurityTest::getTarget, query.getKeyword()))
                .orderByDesc(OaSecurityTest::getId));
        return PageResult.of(page);
    }

    public OaSecurityTest detailSecurityTest(Long id) {
        return requireSecurityTest(id);
    }

    @Transactional
    public Long saveSecurityTest(Long id, OaSecurityTestSaveRequest request) {
        OaSecurityTest entity;
        if (id == null) {
            entity = new OaSecurityTest();
            entity.setScanNo(StringUtils.hasText(request.getScanNo())
                    ? request.getScanNo() : flowSupport.nextBizNo("ST"));
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireSecurityTest(id);
            if (StringUtils.hasText(request.getScanNo())) {
                entity.setScanNo(request.getScanNo());
            }
        }
        entity.setCheckName(request.getCheckName());
        entity.setCheckType(StringUtils.hasText(request.getCheckType()) ? request.getCheckType() : "CODE_SCAN");
        entity.setSeverity(StringUtils.hasText(request.getSeverity()) ? request.getSeverity() : "MEDIUM");
        entity.setTarget(request.getTarget());
        entity.setToolName(request.getToolName());
        entity.setFinding(request.getFinding());
        entity.setSuggestion(request.getSuggestion());
        entity.setFixStatus(StringUtils.hasText(request.getFixStatus()) ? request.getFixStatus() : "OPEN");
        entity.setRiskAccepted(request.getRiskAccepted() == null ? 0 : request.getRiskAccepted());
        entity.setVerifyResult(request.getVerifyResult());
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

    /** 回写整改状态与验证结果。 */
    @Transactional
    public OaSecurityTest fix(Long id, String fixStatus, String verifyResult) {
        OaSecurityTest entity = requireSecurityTest(id);
        entity.setFixStatus(StringUtils.hasText(fixStatus) ? fixStatus : "FIXED");
        entity.setVerifyResult(verifyResult);
        entity.setTestTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    @Transactional
    public void deleteSecurityTest(Long id) {
        requireSecurityTest(id);
        mapper.deleteById(id);
    }

    /** 安全测试统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("critical", mapper.selectCount(Wrappers.<OaSecurityTest>lambdaQuery()
                .eq(OaSecurityTest::getSeverity, "CRITICAL")));
        result.put("high", mapper.selectCount(Wrappers.<OaSecurityTest>lambdaQuery()
                .eq(OaSecurityTest::getSeverity, "HIGH")));
        result.put("medium", mapper.selectCount(Wrappers.<OaSecurityTest>lambdaQuery()
                .eq(OaSecurityTest::getSeverity, "MEDIUM")));
        result.put("low", mapper.selectCount(Wrappers.<OaSecurityTest>lambdaQuery()
                .eq(OaSecurityTest::getSeverity, "LOW")));
        result.put("open", mapper.selectCount(Wrappers.<OaSecurityTest>lambdaQuery()
                .eq(OaSecurityTest::getFixStatus, "OPEN")));
        result.put("fixed", mapper.selectCount(Wrappers.<OaSecurityTest>lambdaQuery()
                .eq(OaSecurityTest::getFixStatus, "FIXED")));
        result.put("accepted", mapper.selectCount(Wrappers.<OaSecurityTest>lambdaQuery()
                .eq(OaSecurityTest::getFixStatus, "ACCEPTED")));
        result.put("riskTolerance", flowSupport.configInt("oa.security.high.risk.tolerance", 0));
        return result;
    }

    public OaSecurityTest requireSecurityTest(Long id) {
        OaSecurityTest entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "安全测试不存在: " + id);
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
