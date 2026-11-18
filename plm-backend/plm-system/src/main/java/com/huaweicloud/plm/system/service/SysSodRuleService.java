package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IamQuery;
import com.huaweicloud.plm.system.dto.SysSodRuleSaveRequest;
import com.huaweicloud.plm.system.entity.SysSodRule;
import com.huaweicloud.plm.system.mapper.SysSodRuleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 职责分离规则（G1-N4 公共平台底座—身份与权限增强 WBS T008 权限审计）：
 * 互斥角色/权限对登记、启停状态流转与统计。
 * 规则编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysSodRuleService {

    private static final String DEFAULT_RISK_LEVEL = "MEDIUM";
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";
    private static final String RISK_HIGH = "HIGH";

    private final SysSodRuleMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询职责分离规则：风险级别/规则状态/业务模块精确，关键字匹配规则编号/名称，时间区间作用于创建时间。 */
    public PageResult<SysSodRule> pageRules(IamQuery query) {
        Page<SysSodRule> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysSodRule>lambdaQuery()
                .eq(StringUtils.hasText(query.getRiskLevel()),
                        SysSodRule::getRiskLevel, query.getRiskLevel())
                .eq(StringUtils.hasText(query.getRuleStatus()),
                        SysSodRule::getRuleStatus, query.getRuleStatus())
                .eq(StringUtils.hasText(query.getBizModule()),
                        SysSodRule::getBizModule, query.getBizModule())
                .ge(StringUtils.hasText(query.getStartDate()), SysSodRule::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysSodRule::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysSodRule::getRuleNo, query.getKeyword()).or()
                        .like(SysSodRule::getRuleName, query.getKeyword()))
                .orderByDesc(SysSodRule::getId));
        return PageResult.of(page);
    }

    public SysSodRule detail(Long id) {
        return require(id);
    }

    /** 新增或更新职责分离规则：新增时回填默认风险级别与规则状态，并回填组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysSodRuleSaveRequest request) {
        SysSodRule entity;
        if (id == null) {
            entity = new SysSodRule();
            entity.setRuleNo(StringUtils.hasText(request.getRuleNo())
                    ? request.getRuleNo() : flowSupport.nextBizNo("SOD"));
            entity.setRiskLevel(DEFAULT_RISK_LEVEL);
            entity.setRuleStatus(STATUS_ACTIVE);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getRuleNo())) {
                entity.setRuleNo(request.getRuleNo());
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

    /** 启用：规则状态置为 ACTIVE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysSodRule enable(Long id) {
        return changeRuleStatus(id, STATUS_ACTIVE);
    }

    /** 停用：规则状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysSodRule disable(Long id) {
        return changeRuleStatus(id, STATUS_DISABLED);
    }

    /** 删除职责分离规则：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 职责分离规则统计：按规则状态与风险级别汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("active", countBy(SysSodRule::getRuleStatus, STATUS_ACTIVE));
        result.put("disabled", countBy(SysSodRule::getRuleStatus, STATUS_DISABLED));
        result.put("highRisk", countBy(SysSodRule::getRiskLevel, RISK_HIGH));
        return result;
    }

    public SysSodRule require(Long id) {
        SysSodRule entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "职责分离规则不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空）时覆盖实体对应字段。 */
    private void applyRequest(SysSodRule entity, SysSodRuleSaveRequest request) {
        if (StringUtils.hasText(request.getRuleName())) {
            entity.setRuleName(request.getRuleName());
        }
        if (StringUtils.hasText(request.getBizModule())) {
            entity.setBizModule(request.getBizModule());
        }
        if (StringUtils.hasText(request.getConflictRoleA())) {
            entity.setConflictRoleA(request.getConflictRoleA());
        }
        if (StringUtils.hasText(request.getConflictRoleB())) {
            entity.setConflictRoleB(request.getConflictRoleB());
        }
        if (StringUtils.hasText(request.getConflictPermA())) {
            entity.setConflictPermA(request.getConflictPermA());
        }
        if (StringUtils.hasText(request.getConflictPermB())) {
            entity.setConflictPermB(request.getConflictPermB());
        }
        if (StringUtils.hasText(request.getRiskLevel())) {
            entity.setRiskLevel(request.getRiskLevel());
        }
        if (StringUtils.hasText(request.getRuleStatus())) {
            entity.setRuleStatus(request.getRuleStatus());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private SysSodRule changeRuleStatus(Long id, String ruleStatus) {
        SysSodRule entity = require(id);
        entity.setRuleStatus(ruleStatus);
        mapper.updateById(entity);
        return entity;
    }

    private Long countBy(SFunction<SysSodRule, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysSodRule>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
