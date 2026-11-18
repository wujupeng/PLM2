package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.CodeRuleGenerateResult;
import com.huaweicloud.plm.system.dto.SysCodeRuleQuery;
import com.huaweicloud.plm.system.dto.SysCodeRuleSaveRequest;
import com.huaweicloud.plm.system.entity.SysCodeRule;
import com.huaweicloud.plm.system.mapper.SysCodeRuleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 编码规则（G1-N6 公共平台底座—通用能力 WBS T105 数据质量控制）：
 * 编码规则登记、启停状态流转、编码生成与统计。
 * 规则编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysCodeRuleService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";
    private static final int DEFAULT_SEQ_LENGTH = 4;
    private static final int DEFAULT_CURRENT_SEQ = 0;
    private static final String DEFAULT_RESET_CYCLE = "NONE";

    private final SysCodeRuleMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询编码规则：编码编码/目标实体/重置周期/状态精确，规则名称模糊，时间区间作用于创建时间。 */
    public PageResult<SysCodeRule> pageCodeRules(SysCodeRuleQuery query) {
        Page<SysCodeRule> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysCodeRule>lambdaQuery()
                .eq(StringUtils.hasText(query.getCodeCode()),
                        SysCodeRule::getCodeCode, query.getCodeCode())
                .like(StringUtils.hasText(query.getCodeName()),
                        SysCodeRule::getCodeName, query.getCodeName())
                .eq(StringUtils.hasText(query.getTargetEntity()),
                        SysCodeRule::getTargetEntity, query.getTargetEntity())
                .eq(StringUtils.hasText(query.getResetCycle()),
                        SysCodeRule::getResetCycle, query.getResetCycle())
                .eq(StringUtils.hasText(query.getCodeStatus()),
                        SysCodeRule::getCodeStatus, query.getCodeStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysCodeRule::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysCodeRule::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysCodeRule::getCodeNo, query.getKeyword()).or()
                        .like(SysCodeRule::getCodeCode, query.getKeyword()).or()
                        .like(SysCodeRule::getCodeName, query.getKeyword()))
                .orderByDesc(SysCodeRule::getId));
        return PageResult.of(page);
    }

    public SysCodeRule detail(Long id) {
        return require(id);
    }

    /** 新增或更新编码规则：新增时回填默认流水号长度/重置周期/当前流水/状态与组织，规则编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysCodeRuleSaveRequest request) {
        SysCodeRule entity;
        if (id == null) {
            entity = new SysCodeRule();
            entity.setCodeNo(StringUtils.hasText(request.getCodeNo())
                    ? request.getCodeNo() : flowSupport.nextBizNo("DQC"));
            entity.setSeqLength(request.getSeqLength() == null ? DEFAULT_SEQ_LENGTH : request.getSeqLength());
            entity.setResetCycle(StringUtils.hasText(request.getResetCycle())
                    ? request.getResetCycle() : DEFAULT_RESET_CYCLE);
            entity.setCurrentSeq(request.getCurrentSeq() == null ? DEFAULT_CURRENT_SEQ : request.getCurrentSeq());
            entity.setCodeStatus(StringUtils.hasText(request.getCodeStatus())
                    ? request.getCodeStatus() : STATUS_ACTIVE);
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
    public SysCodeRule enable(Long id) {
        return changeCodeStatus(id, STATUS_ACTIVE);
    }

    /** 停用：规则状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysCodeRule disable(Long id) {
        return changeCodeStatus(id, STATUS_DISABLED);
    }

    /**
     * 生成编码：当前流水值自增 1 并写回数据库，
     * 按「前缀 + 日期段（datePattern 格式化当前时间）+ 流水号（左补 0 到 seqLength 位）」拼接返回。
     */
    @Transactional(rollbackFor = Exception.class)
    public CodeRuleGenerateResult generate(Long id) {
        SysCodeRule rule = require(id);
        int nextSeq = (rule.getCurrentSeq() == null ? DEFAULT_CURRENT_SEQ : rule.getCurrentSeq()) + 1;
        rule.setCurrentSeq(nextSeq);
        mapper.updateById(rule);

        String prefix = rule.getPrefix() == null ? "" : rule.getPrefix();
        String datePart = formatDatePart(rule.getDatePattern());
        int seqLength = rule.getSeqLength() == null || rule.getSeqLength() < 1
                ? DEFAULT_SEQ_LENGTH : rule.getSeqLength();
        String seqPart = String.format("%0" + seqLength + "d", nextSeq);

        CodeRuleGenerateResult result = new CodeRuleGenerateResult();
        result.setCodeRuleId(rule.getId());
        result.setCodeName(rule.getCodeName());
        result.setTargetEntity(rule.getTargetEntity());
        result.setGeneratedCode(prefix + datePart + seqPart);
        result.setCurrentSeq(nextSeq);
        return result;
    }

    /** 删除编码规则：物理删除以释放规则编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 编码规则统计：按规则状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("active", countBy(SysCodeRule::getCodeStatus, STATUS_ACTIVE));
        result.put("disabled", countBy(SysCodeRule::getCodeStatus, STATUS_DISABLED));
        return result;
    }

    public SysCodeRule require(Long id) {
        SysCodeRule entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "编码规则不存在: " + id);
        }
        return entity;
    }

    /** 按日期段格式（yyyyMMdd/yyyyMM/yyyy 等）格式化当前时间，为空或非法格式时拼接空串。 */
    private String formatDatePart(String datePattern) {
        if (!StringUtils.hasText(datePattern)) {
            return "";
        }
        try {
            return LocalDateTime.now().format(DateTimeFormatter.ofPattern(datePattern.trim()));
        } catch (Exception e) {
            return "";
        }
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysCodeRule entity, SysCodeRuleSaveRequest request) {
        if (StringUtils.hasText(request.getCodeNo())) {
            entity.setCodeNo(request.getCodeNo());
        }
        if (StringUtils.hasText(request.getCodeCode())) {
            entity.setCodeCode(request.getCodeCode());
        }
        if (StringUtils.hasText(request.getCodeName())) {
            entity.setCodeName(request.getCodeName());
        }
        if (StringUtils.hasText(request.getTargetEntity())) {
            entity.setTargetEntity(request.getTargetEntity());
        }
        if (StringUtils.hasText(request.getPrefix())) {
            entity.setPrefix(request.getPrefix());
        }
        if (StringUtils.hasText(request.getDatePattern())) {
            entity.setDatePattern(request.getDatePattern());
        }
        if (request.getSeqLength() != null) {
            entity.setSeqLength(request.getSeqLength());
        }
        if (StringUtils.hasText(request.getResetCycle())) {
            entity.setResetCycle(request.getResetCycle());
        }
        if (request.getCurrentSeq() != null) {
            entity.setCurrentSeq(request.getCurrentSeq());
        }
        if (StringUtils.hasText(request.getCodeStatus())) {
            entity.setCodeStatus(request.getCodeStatus());
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

    private SysCodeRule changeCodeStatus(Long id, String codeStatus) {
        SysCodeRule entity = require(id);
        entity.setCodeStatus(codeStatus);
        mapper.updateById(entity);
        return entity;
    }

    private Long countBy(SFunction<SysCodeRule, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysCodeRule>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
