package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizApiAccessLogSaveRequest;
import com.huaweicloud.plm.system.dto.BizApiCredentialSaveRequest;
import com.huaweicloud.plm.system.dto.BizApiPolicySaveRequest;
import com.huaweicloud.plm.system.dto.OaIntegrationQuery;
import com.huaweicloud.plm.system.entity.OaApiAccessLog;
import com.huaweicloud.plm.system.entity.OaApiCredential;
import com.huaweicloud.plm.system.entity.OaApiPolicy;
import com.huaweicloud.plm.system.mapper.OaApiAccessLogMapper;
import com.huaweicloud.plm.system.mapper.OaApiCredentialMapper;
import com.huaweicloud.plm.system.mapper.OaApiPolicyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 统一 API 网关（OA-DEV-086）：策略、凭证、访问审计与凭证到期监控（OA-DEV-094）。
 * 限流阈值、签名开关、凭证到期提醒天数等均为可配置项。
 */
@Service
@RequiredArgsConstructor
public class OaApiGatewayService {

    private final OaApiPolicyMapper policyMapper;
    private final OaApiCredentialMapper credentialMapper;
    private final OaApiAccessLogMapper accessLogMapper;
    private final OaBizFlowSupport flowSupport;

    // ================= 策略 =================

    public PageResult<OaApiPolicy> pagePolicies(OaIntegrationQuery query) {
        Page<OaApiPolicy> page = query.toPage();
        policyMapper.selectPage(page, Wrappers.<OaApiPolicy>lambdaQuery()
                .eq(query.getStatus() != null, OaApiPolicy::getStatus, query.getStatus())
                .like(StringUtils.hasText(query.getSystemCode()), OaApiPolicy::getUpstream, query.getSystemCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaApiPolicy::getPolicyNo, query.getKeyword()).or()
                        .like(OaApiPolicy::getPolicyName, query.getKeyword()).or()
                        .like(OaApiPolicy::getPathPrefix, query.getKeyword()))
                .orderByDesc(OaApiPolicy::getId));
        return PageResult.of(page);
    }

    public OaApiPolicy detailPolicy(Long id) {
        return requirePolicy(id);
    }

    public List<OaApiPolicy> listEnabledPolicies() {
        return policyMapper.selectList(Wrappers.<OaApiPolicy>lambdaQuery()
                .eq(OaApiPolicy::getStatus, 1)
                .orderByAsc(OaApiPolicy::getPathPrefix));
    }

    @Transactional
    public Long savePolicy(Long id, BizApiPolicySaveRequest request) {
        if (!StringUtils.hasText(request.getPolicyName())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "策略名称不能为空");
        }
        if (!StringUtils.hasText(request.getPathPrefix())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "路径前缀不能为空");
        }
        OaApiPolicy entity;
        if (id == null) {
            entity = new OaApiPolicy();
            entity.setPolicyNo(StringUtils.hasText(request.getPolicyNo())
                    ? request.getPolicyNo() : flowSupport.nextBizNo("API"));
            entity.setOrgId(currentOrgId());
            entity.setRateLimitQps(request.getRateLimitQps() != null ? request.getRateLimitQps()
                    : flowSupport.configInt("oa.integration.api.rate.limit.default", 100));
        } else {
            entity = requirePolicy(id);
            if (StringUtils.hasText(request.getPolicyNo())) {
                entity.setPolicyNo(request.getPolicyNo());
            }
        }
        entity.setPolicyName(request.getPolicyName());
        entity.setPathPrefix(request.getPathPrefix());
        entity.setUpstream(request.getUpstream());
        entity.setHttpMethods(request.getHttpMethods());
        entity.setAuthType(StringUtils.hasText(request.getAuthType()) ? request.getAuthType() : "JWT");
        if (request.getRateLimitQps() != null) {
            entity.setRateLimitQps(request.getRateLimitQps());
        }
        entity.setSignatureFlag(toFlag(request.getSignatureFlag(),
                flowSupport.configBoolean("oa.integration.api.signature.enabled", false)));
        entity.setApiVersion(StringUtils.hasText(request.getApiVersion()) ? request.getApiVersion() : "v1");
        entity.setIpAllowList(request.getIpAllowList());
        entity.setIpDenyList(request.getIpDenyList());
        entity.setAuditFlag(toFlag(request.getAuditFlag(), true));
        entity.setStatus(request.getStatus() != null ? request.getStatus() : 1);
        entity.setRemark(request.getRemark());
        if (id == null) {
            policyMapper.insert(entity);
        } else {
            policyMapper.updateById(entity);
        }
        return entity.getId();
    }

    @Transactional
    public void deletePolicy(Long id) {
        requirePolicy(id);
        policyMapper.deleteById(id);
    }

    // ================= 凭证 =================

    public PageResult<OaApiCredential> pageCredentials(OaIntegrationQuery query) {
        Page<OaApiCredential> page = query.toPage();
        credentialMapper.selectPage(page, Wrappers.<OaApiCredential>lambdaQuery()
                .eq(query.getStatus() != null, OaApiCredential::getStatus, query.getStatus())
                .eq(StringUtils.hasText(query.getSystemCode()), OaApiCredential::getOwnerSystem, query.getSystemCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaApiCredential::getCredentialNo, query.getKeyword()).or()
                        .like(OaApiCredential::getCredentialName, query.getKeyword()).or()
                        .like(OaApiCredential::getAppKey, query.getKeyword()))
                .orderByDesc(OaApiCredential::getId));
        return PageResult.of(page);
    }

    public OaApiCredential detailCredential(Long id) {
        return requireCredential(id);
    }

    /** 即将到期凭证（含配置的提前提醒天数）。 */
    public List<OaApiCredential> listExpiringCredentials() {
        int days = flowSupport.configInt("oa.integration.credential.expire.alert.days", 30);
        LocalDate threshold = LocalDate.now().plusDays(days);
        return credentialMapper.selectList(Wrappers.<OaApiCredential>lambdaQuery()
                .isNotNull(OaApiCredential::getExpireDate)
                .le(OaApiCredential::getExpireDate, threshold)
                .orderByAsc(OaApiCredential::getExpireDate));
    }

    @Transactional
    public Long saveCredential(Long id, BizApiCredentialSaveRequest request) {
        if (!StringUtils.hasText(request.getCredentialName())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "凭证名称不能为空");
        }
        if (!StringUtils.hasText(request.getAppKey())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "AppKey 不能为空");
        }
        OaApiCredential entity;
        if (id == null) {
            entity = new OaApiCredential();
            entity.setCredentialNo(StringUtils.hasText(request.getCredentialNo())
                    ? request.getCredentialNo() : flowSupport.nextBizNo("CRD"));
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireCredential(id);
            if (StringUtils.hasText(request.getCredentialNo())) {
                entity.setCredentialNo(request.getCredentialNo());
            }
        }
        entity.setCredentialName(request.getCredentialName());
        entity.setAppKey(request.getAppKey());
        if (StringUtils.hasText(request.getAppSecret())) {
            entity.setAppSecret(request.getAppSecret());
        }
        entity.setOwnerSystem(request.getOwnerSystem());
        entity.setExpireDate(OaBizFlowSupport.parseDate(request.getExpireDate()));
        entity.setStatus(request.getStatus() != null ? request.getStatus() : 1);
        entity.setAlertFlag(isExpiring(entity.getExpireDate()) ? 1 : 0);
        entity.setRemark(request.getRemark());
        if (id == null) {
            credentialMapper.insert(entity);
        } else {
            credentialMapper.updateById(entity);
        }
        return entity.getId();
    }

    @Transactional
    public void deleteCredential(Long id) {
        requireCredential(id);
        credentialMapper.deleteById(id);
    }

    // ================= 访问审计 =================

    public PageResult<OaApiAccessLog> pageAccessLogs(OaIntegrationQuery query) {
        Page<OaApiAccessLog> page = query.toPage();
        accessLogMapper.selectPage(page, Wrappers.<OaApiAccessLog>lambdaQuery()
                .eq(StringUtils.hasText(query.getClientSystem()), OaApiAccessLog::getClientSystem, query.getClientSystem())
                .eq(query.getStatus() != null, OaApiAccessLog::getStatusCode, query.getStatus())
                .ge(query.getStartDate() != null, OaApiAccessLog::getAccessTime, OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(query.getEndDate() != null, OaApiAccessLog::getAccessTime, OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaApiAccessLog::getPath, query.getKeyword()).or()
                        .like(OaApiAccessLog::getTraceId, query.getKeyword()).or()
                        .like(OaApiAccessLog::getOperatorName, query.getKeyword()))
                .orderByDesc(OaApiAccessLog::getId));
        return PageResult.of(page);
    }

    public OaApiAccessLog detailAccessLog(Long id) {
        OaApiAccessLog entity = accessLogMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "访问审计记录不存在: " + id);
        }
        return entity;
    }

    @Transactional
    public Long recordAccessLog(BizApiAccessLogSaveRequest request) {
        if (!StringUtils.hasText(request.getPath())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "请求路径不能为空");
        }
        OaApiAccessLog entity = new OaApiAccessLog();
        entity.setTraceId(StringUtils.hasText(request.getTraceId())
                ? request.getTraceId() : flowSupport.nextBizNo("TRC"));
        entity.setPath(request.getPath());
        entity.setHttpMethod(request.getHttpMethod());
        entity.setClientSystem(request.getClientSystem());
        entity.setAppKey(request.getAppKey());
        entity.setOperatorUserId(request.getOperatorUserId() != null ? request.getOperatorUserId() : UserContext.getUserId());
        entity.setOperatorName(StringUtils.hasText(request.getOperatorName())
                ? request.getOperatorName() : currentDisplayName());
        entity.setIpAddress(request.getIpAddress());
        entity.setStatusCode(request.getStatusCode() != null ? request.getStatusCode() : 200);
        entity.setResultCode(request.getResultCode());
        entity.setCostMs(request.getCostMs());
        entity.setRequestSummary(request.getRequestSummary());
        entity.setErrorMsg(request.getErrorMsg());
        entity.setAccessTime(LocalDateTime.now());
        entity.setOrgId(currentOrgId());
        entity.setRemark(request.getRemark());
        accessLogMapper.insert(entity);
        return entity.getId();
    }

    @Transactional
    public void deleteAccessLog(Long id) {
        detailAccessLog(id);
        accessLogMapper.deleteById(id);
    }

    /** 访问审计统计。 */
    public Map<String, Object> accessLogStats(OaIntegrationQuery query) {
        List<OaApiAccessLog> logs = accessLogMapper.selectList(Wrappers.<OaApiAccessLog>lambdaQuery()
                .eq(StringUtils.hasText(query.getClientSystem()), OaApiAccessLog::getClientSystem, query.getClientSystem())
                .ge(query.getStartDate() != null, OaApiAccessLog::getAccessTime, OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(query.getEndDate() != null, OaApiAccessLog::getAccessTime, OaBizFlowSupport.endOfDay(query.getEndDate())));
        long total = logs.size();
        long fail = logs.stream().filter(l -> l.getStatusCode() != null && l.getStatusCode() != 200).count();
        double avgCost = logs.stream().filter(l -> l.getCostMs() != null)
                .mapToInt(OaApiAccessLog::getCostMs).average().orElse(0d);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", total);
        result.put("success", total - fail);
        result.put("fail", fail);
        result.put("avgCostMs", Math.round(avgCost));
        return result;
    }

    /** 网关总览。 */
    public Map<String, Object> overview() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("policyTotal", policyMapper.selectCount(null));
        result.put("policyEnabled", policyMapper.selectCount(Wrappers.<OaApiPolicy>lambdaQuery()
                .eq(OaApiPolicy::getStatus, 1)));
        result.put("credentialTotal", credentialMapper.selectCount(null));
        result.put("credentialExpiring", (long) listExpiringCredentials().size());
        result.put("accessTotal", accessLogMapper.selectCount(null));
        result.put("accessFail", accessLogMapper.selectCount(Wrappers.<OaApiAccessLog>lambdaQuery()
                .ne(OaApiAccessLog::getStatusCode, 200)));
        result.put("rateLimitDefault", flowSupport.configInt("oa.integration.api.rate.limit.default", 100));
        result.put("credentialAlertDays", flowSupport.configInt("oa.integration.credential.expire.alert.days", 30));
        return result;
    }

    // ================= 辅助 =================

    public OaApiPolicy requirePolicy(Long id) {
        OaApiPolicy entity = policyMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "API 策略不存在: " + id);
        }
        return entity;
    }

    public OaApiCredential requireCredential(Long id) {
        OaApiCredential entity = credentialMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "集成凭证不存在: " + id);
        }
        return entity;
    }

    private boolean isExpiring(LocalDate expireDate) {
        if (expireDate == null) {
            return false;
        }
        int days = flowSupport.configInt("oa.integration.credential.expire.alert.days", 30);
        return !expireDate.isAfter(LocalDate.now().plusDays(days));
    }

    private Integer toFlag(Boolean value, boolean defaultValue) {
        boolean flag = value == null ? defaultValue : value;
        return flag ? 1 : 0;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }

    private String currentDisplayName() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.displayName();
    }
}
