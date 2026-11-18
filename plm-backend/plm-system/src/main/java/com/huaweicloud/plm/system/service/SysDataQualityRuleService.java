package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.DataQualityRuleQuery;
import com.huaweicloud.plm.system.dto.SysDataQualityRuleSaveRequest;
import com.huaweicloud.plm.system.entity.SysDataQualityRule;
import com.huaweicloud.plm.system.mapper.SysDataQualityRuleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 数据质量规则（G1-N6 公共平台底座—通用能力 WBS T105 数据质量控制）：
 * 规则登记、启停状态流转与统计。
 * 规则编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysDataQualityRuleService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";
    private static final String DEFAULT_RULE_TYPE = "REQUIRED";
    private static final String DEFAULT_ERROR_LEVEL = "ERROR";

    private final SysDataQualityRuleMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询数据质量规则：编码/目标实体/类型/异常级别/状态精确，规则名称模糊，时间区间作用于创建时间。 */
    public PageResult<SysDataQualityRule> pageRules(DataQualityRuleQuery query) {
        Page<SysDataQualityRule> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysDataQualityRule>lambdaQuery()
                .eq(StringUtils.hasText(query.getRuleCode()),
                        SysDataQualityRule::getRuleCode, query.getRuleCode())
                .like(StringUtils.hasText(query.getRuleName()),
                        SysDataQualityRule::getRuleName, query.getRuleName())
                .eq(StringUtils.hasText(query.getTargetEntity()),
                        SysDataQualityRule::getTargetEntity, query.getTargetEntity())
                .eq(StringUtils.hasText(query.getRuleType()),
                        SysDataQualityRule::getRuleType, query.getRuleType())
                .eq(StringUtils.hasText(query.getErrorLevel()),
                        SysDataQualityRule::getErrorLevel, query.getErrorLevel())
                .eq(StringUtils.hasText(query.getRuleStatus()),
                        SysDataQualityRule::getRuleStatus, query.getRuleStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysDataQualityRule::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysDataQualityRule::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysDataQualityRule::getRuleNo, query.getKeyword()).or()
                        .like(SysDataQualityRule::getRuleCode, query.getKeyword()).or()
                        .like(SysDataQualityRule::getRuleName, query.getKeyword()))
                .orderByDesc(SysDataQualityRule::getId));
        return PageResult.of(page);
    }

    public SysDataQualityRule detail(Long id) {
        return require(id);
    }

    /** 新增或更新数据质量规则：新增时回填默认类型/异常级别/状态与组织，规则编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysDataQualityRuleSaveRequest request) {
        SysDataQualityRule entity;
        if (id == null) {
            entity = new SysDataQualityRule();
            entity.setRuleNo(StringUtils.hasText(request.getRuleNo())
                    ? request.getRuleNo() : flowSupport.nextBizNo("DQR"));
            entity.setRuleType(StringUtils.hasText(request.getRuleType())
                    ? request.getRuleType() : DEFAULT_RULE_TYPE);
            entity.setErrorLevel(StringUtils.hasText(request.getErrorLevel())
                    ? request.getErrorLevel() : DEFAULT_ERROR_LEVEL);
            entity.setRuleStatus(StringUtils.hasText(request.getRuleStatus())
                    ? request.getRuleStatus() : STATUS_ACTIVE);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
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
    public SysDataQualityRule enable(Long id) {
        return changeRuleStatus(id, STATUS_ACTIVE);
    }

    /** 停用：规则状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysDataQualityRule disable(Long id) {
        return changeRuleStatus(id, STATUS_DISABLED);
    }

    /** 删除数据质量规则：物理删除以释放规则编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 数据质量规则统计：按规则状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("active", countBy(SysDataQualityRule::getRuleStatus, STATUS_ACTIVE));
        result.put("disabled", countBy(SysDataQualityRule::getRuleStatus, STATUS_DISABLED));
        return result;
    }

    public SysDataQualityRule require(Long id) {
        SysDataQualityRule entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "数据质量规则不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空）时覆盖实体对应字段。 */
    private void applyRequest(SysDataQualityRule entity, SysDataQualityRuleSaveRequest request) {
        if (StringUtils.hasText(request.getRuleNo())) {
            entity.setRuleNo(request.getRuleNo());
        }
        if (StringUtils.hasText(request.getRuleCode())) {
            entity.setRuleCode(request.getRuleCode());
        }
        if (StringUtils.hasText(request.getRuleName())) {
            entity.setRuleName(request.getRuleName());
        }
        if (StringUtils.hasText(request.getTargetEntity())) {
            entity.setTargetEntity(request.getTargetEntity());
        }
        if (StringUtils.hasText(request.getRuleType())) {
            entity.setRuleType(request.getRuleType());
        }
        if (StringUtils.hasText(request.getRuleExpr())) {
            entity.setRuleExpr(request.getRuleExpr());
        }
        if (StringUtils.hasText(request.getErrorLevel())) {
            entity.setErrorLevel(request.getErrorLevel());
        }
        if (StringUtils.hasText(request.getRuleStatus())) {
            entity.setRuleStatus(request.getRuleStatus());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private SysDataQualityRule changeRuleStatus(Long id, String ruleStatus) {
        SysDataQualityRule entity = require(id);
        entity.setRuleStatus(ruleStatus);
        mapper.updateById(entity);
        return entity;
    }

    private Long countBy(SFunction<SysDataQualityRule, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysDataQualityRule>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
