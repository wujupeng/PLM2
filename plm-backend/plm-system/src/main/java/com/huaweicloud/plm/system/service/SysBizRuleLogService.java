package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizRuleLogQuery;
import com.huaweicloud.plm.system.dto.SysBizRuleLogSaveRequest;
import com.huaweicloud.plm.system.entity.SysBizRuleLog;
import com.huaweicloud.plm.system.mapper.SysBizRuleLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 规则执行日志（G1-N6 公共平台底座—通用能力 WBS T104 业务规则引擎）：
 * 规则执行日志登记、查询与统计，日志只追加不修改。
 * 日志编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysBizRuleLogService {

    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private static final String MATCH = "MATCH";
    private static final String NOT_MATCH = "NOT_MATCH";
    private static final String ERROR = "ERROR";
    private static final int DEFAULT_COST_MS = 0;

    private final SysBizRuleLogMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询规则执行日志：规则编码/业务模块/业务主键/命中结果精确，时间区间作用于执行时间。 */
    public PageResult<SysBizRuleLog> pageLogs(BizRuleLogQuery query) {
        Page<SysBizRuleLog> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysBizRuleLog>lambdaQuery()
                .eq(StringUtils.hasText(query.getRuleCode()),
                        SysBizRuleLog::getRuleCode, query.getRuleCode())
                .eq(StringUtils.hasText(query.getBizModule()),
                        SysBizRuleLog::getBizModule, query.getBizModule())
                .eq(StringUtils.hasText(query.getBizKey()),
                        SysBizRuleLog::getBizKey, query.getBizKey())
                .eq(StringUtils.hasText(query.getMatchResult()),
                        SysBizRuleLog::getMatchResult, query.getMatchResult())
                .ge(StringUtils.hasText(query.getStartDate()), SysBizRuleLog::getExecTime,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysBizRuleLog::getExecTime,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysBizRuleLog::getLogNo, query.getKeyword()).or()
                        .like(SysBizRuleLog::getRuleCode, query.getKeyword()).or()
                        .like(SysBizRuleLog::getBizKey, query.getKeyword()))
                .orderByDesc(SysBizRuleLog::getId));
        return PageResult.of(page);
    }

    public SysBizRuleLog detail(Long id) {
        return require(id);
    }

    /** 新增或更新规则执行日志：新增时回填默认命中结果/耗时与组织，日志编号为空时自动生成，执行时间为空时取当前时间。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysBizRuleLogSaveRequest request) {
        SysBizRuleLog entity;
        if (id == null) {
            entity = new SysBizRuleLog();
            entity.setLogNo(StringUtils.hasText(request.getLogNo())
                    ? request.getLogNo() : flowSupport.nextBizNo("BRL"));
            entity.setMatchResult(StringUtils.hasText(request.getMatchResult())
                    ? request.getMatchResult() : MATCH);
            entity.setCostMs(request.getCostMs() == null ? DEFAULT_COST_MS : request.getCostMs());
            LocalDateTime execTime = parseTimestamp(request.getExecTime());
            entity.setExecTime(execTime == null ? LocalDateTime.now() : execTime);
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

    /** 删除规则执行日志：物理删除以释放日志编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 规则执行日志统计：按命中结果汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("matchCount", countBy(SysBizRuleLog::getMatchResult, MATCH));
        result.put("notMatchCount", countBy(SysBizRuleLog::getMatchResult, NOT_MATCH));
        result.put("errorCount", countBy(SysBizRuleLog::getMatchResult, ERROR));
        return result;
    }

    public SysBizRuleLog require(Long id) {
        SysBizRuleLog entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "规则执行日志不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysBizRuleLog entity, SysBizRuleLogSaveRequest request) {
        if (StringUtils.hasText(request.getLogNo())) {
            entity.setLogNo(request.getLogNo());
        }
        if (StringUtils.hasText(request.getRuleCode())) {
            entity.setRuleCode(request.getRuleCode());
        }
        if (StringUtils.hasText(request.getBizModule())) {
            entity.setBizModule(request.getBizModule());
        }
        if (StringUtils.hasText(request.getBizKey())) {
            entity.setBizKey(request.getBizKey());
        }
        if (request.getInputData() != null) {
            entity.setInputData(request.getInputData());
        }
        if (request.getOutputData() != null) {
            entity.setOutputData(request.getOutputData());
        }
        if (StringUtils.hasText(request.getMatchResult())) {
            entity.setMatchResult(request.getMatchResult());
        }
        if (request.getCostMs() != null) {
            entity.setCostMs(request.getCostMs());
        }
        if (StringUtils.hasText(request.getExecTime())) {
            LocalDateTime parsed = parseTimestamp(request.getExecTime());
            if (parsed != null) {
                entity.setExecTime(parsed);
            }
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

    /** 解析时间字符串为 LocalDateTime，空白或非法返回 null。 */
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

    private Long countBy(SFunction<SysBizRuleLog, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysBizRuleLog>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
