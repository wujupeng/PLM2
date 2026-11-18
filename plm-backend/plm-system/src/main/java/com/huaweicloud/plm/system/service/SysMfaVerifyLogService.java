package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IamQuery;
import com.huaweicloud.plm.system.dto.SysMfaVerifyLogSaveRequest;
import com.huaweicloud.plm.system.entity.SysMfaVerifyLog;
import com.huaweicloud.plm.system.mapper.SysMfaVerifyLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * MFA 校验日志（G1-N4 公共平台底座—身份与权限增强 WBS T006 统一身份 / 敏感操作追踪）：
 * 多因素认证校验留痕登记与统计。
 * 日志编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysMfaVerifyLogService {

    private static final String DEFAULT_MFA_TYPE = "TOTP";
    private static final String DEFAULT_VERIFY_SCENE = "LOGIN";
    private static final String RESULT_SUCCESS = "SUCCESS";
    private static final String RESULT_FAIL = "FAIL";
    private static final String RESULT_EXPIRED = "EXPIRED";

    private final SysMfaVerifyLogMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询 MFA 校验日志：认证方式/校验场景/校验结果/用户名精确，关键字匹配编号/用户名，时间区间作用于创建时间。 */
    public PageResult<SysMfaVerifyLog> pageLogs(IamQuery query) {
        Page<SysMfaVerifyLog> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysMfaVerifyLog>lambdaQuery()
                .eq(StringUtils.hasText(query.getMfaType()),
                        SysMfaVerifyLog::getMfaType, query.getMfaType())
                .eq(StringUtils.hasText(query.getVerifyScene()),
                        SysMfaVerifyLog::getVerifyScene, query.getVerifyScene())
                .eq(StringUtils.hasText(query.getVerifyResult()),
                        SysMfaVerifyLog::getVerifyResult, query.getVerifyResult())
                .eq(StringUtils.hasText(query.getUsername()),
                        SysMfaVerifyLog::getUsername, query.getUsername())
                .ge(StringUtils.hasText(query.getStartDate()), SysMfaVerifyLog::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysMfaVerifyLog::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysMfaVerifyLog::getLogNo, query.getKeyword()).or()
                        .like(SysMfaVerifyLog::getUsername, query.getKeyword()).or()
                        .like(SysMfaVerifyLog::getClientIp, query.getKeyword()))
                .orderByDesc(SysMfaVerifyLog::getId));
        return PageResult.of(page);
    }

    public SysMfaVerifyLog detail(Long id) {
        return require(id);
    }

    /** 新增或更新 MFA 校验日志：新增时回填默认认证方式、校验场景与结果，校验时间为空则取当前时间。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysMfaVerifyLogSaveRequest request) {
        SysMfaVerifyLog entity;
        if (id == null) {
            entity = new SysMfaVerifyLog();
            entity.setLogNo(StringUtils.hasText(request.getLogNo())
                    ? request.getLogNo() : flowSupport.nextBizNo("MFL"));
            entity.setMfaType(DEFAULT_MFA_TYPE);
            entity.setVerifyScene(DEFAULT_VERIFY_SCENE);
            entity.setVerifyResult(RESULT_SUCCESS);
            entity.setCostMs(0);
            entity.setVerifyTime(LocalDateTime.now());
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getLogNo())) {
                entity.setLogNo(request.getLogNo());
            }
        }
        applyRequest(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 删除 MFA 校验日志：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** MFA 校验日志统计：按校验结果汇总并累计校验耗时。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("success", countBy(SysMfaVerifyLog::getVerifyResult, RESULT_SUCCESS));
        result.put("fail", countBy(SysMfaVerifyLog::getVerifyResult, RESULT_FAIL));
        result.put("expired", countBy(SysMfaVerifyLog::getVerifyResult, RESULT_EXPIRED));
        long totalCostMs = 0L;
        List<SysMfaVerifyLog> all = mapper.selectList(null);
        if (all != null) {
            for (SysMfaVerifyLog item : all) {
                totalCostMs += item.getCostMs() == null ? 0 : item.getCostMs();
            }
        }
        result.put("totalCostMs", totalCostMs);
        return result;
    }

    public SysMfaVerifyLog require(Long id) {
        SysMfaVerifyLog entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "MFA 校验日志不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/时间非空）时覆盖实体对应字段。 */
    private void applyRequest(SysMfaVerifyLog entity, SysMfaVerifyLogSaveRequest request) {
        if (request.getUserId() != null) {
            entity.setUserId(request.getUserId());
        }
        if (StringUtils.hasText(request.getUsername())) {
            entity.setUsername(request.getUsername());
        }
        if (StringUtils.hasText(request.getMfaType())) {
            entity.setMfaType(request.getMfaType());
        }
        if (StringUtils.hasText(request.getVerifyScene())) {
            entity.setVerifyScene(request.getVerifyScene());
        }
        if (StringUtils.hasText(request.getVerifyResult())) {
            entity.setVerifyResult(request.getVerifyResult());
        }
        if (StringUtils.hasText(request.getFailReason())) {
            entity.setFailReason(request.getFailReason());
        }
        if (StringUtils.hasText(request.getClientIp())) {
            entity.setClientIp(request.getClientIp());
        }
        if (request.getVerifyTime() != null) {
            entity.setVerifyTime(request.getVerifyTime());
        }
        if (request.getCostMs() != null) {
            entity.setCostMs(request.getCostMs());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private Long countBy(SFunction<SysMfaVerifyLog, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysMfaVerifyLog>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
