package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IamQuery;
import com.huaweicloud.plm.system.dto.SysSodViolationSaveRequest;
import com.huaweicloud.plm.system.entity.SysSodViolation;
import com.huaweicloud.plm.system.mapper.SysSodViolationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 职责分离违规记录（G1-N4 公共平台底座—身份与权限增强 WBS T008 权限审计）：
 * 违规记录登记、整改/忽略处理与统计。
 * 违规编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysSodViolationService {

    private static final String DEFAULT_RISK_LEVEL = "MEDIUM";
    private static final String STATUS_OPEN = "OPEN";
    private static final String STATUS_HANDLING = "HANDLING";
    private static final String STATUS_RESOLVED = "RESOLVED";
    private static final String STATUS_IGNORED = "IGNORED";

    private final SysSodViolationMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询违规记录：风险级别/处理状态/用户名精确，关键字匹配违规编号/规则编号/用户名，时间区间作用于创建时间。 */
    public PageResult<SysSodViolation> pageViolations(IamQuery query) {
        Page<SysSodViolation> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysSodViolation>lambdaQuery()
                .eq(StringUtils.hasText(query.getRiskLevel()),
                        SysSodViolation::getRiskLevel, query.getRiskLevel())
                .eq(StringUtils.hasText(query.getHandleStatus()),
                        SysSodViolation::getHandleStatus, query.getHandleStatus())
                .eq(StringUtils.hasText(query.getUsername()),
                        SysSodViolation::getUsername, query.getUsername())
                .ge(StringUtils.hasText(query.getStartDate()), SysSodViolation::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysSodViolation::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysSodViolation::getViolationNo, query.getKeyword()).or()
                        .like(SysSodViolation::getRuleNo, query.getKeyword()).or()
                        .like(SysSodViolation::getUsername, query.getKeyword()))
                .orderByDesc(SysSodViolation::getId));
        return PageResult.of(page);
    }

    public SysSodViolation detail(Long id) {
        return require(id);
    }

    /** 新增或更新违规记录：新增时回填默认风险级别与处理状态，检测时间为空则取当前时间。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysSodViolationSaveRequest request) {
        SysSodViolation entity;
        if (id == null) {
            entity = new SysSodViolation();
            entity.setViolationNo(StringUtils.hasText(request.getViolationNo())
                    ? request.getViolationNo() : flowSupport.nextBizNo("SV"));
            entity.setRiskLevel(DEFAULT_RISK_LEVEL);
            entity.setHandleStatus(STATUS_OPEN);
            entity.setDetectTime(LocalDateTime.now());
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getViolationNo())) {
                entity.setViolationNo(request.getViolationNo());
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

    /** 整改：处理状态置为 RESOLVED 并记录处理时间。 */
    @Transactional(rollbackFor = Exception.class)
    public SysSodViolation resolve(Long id) {
        return changeHandleStatus(id, STATUS_RESOLVED);
    }

    /** 忽略：处理状态置为 IGNORED 并记录处理时间。 */
    @Transactional(rollbackFor = Exception.class)
    public SysSodViolation ignore(Long id) {
        return changeHandleStatus(id, STATUS_IGNORED);
    }

    /** 删除违规记录：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 违规记录统计：按处理状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("open", countBy(SysSodViolation::getHandleStatus, STATUS_OPEN));
        result.put("handling", countBy(SysSodViolation::getHandleStatus, STATUS_HANDLING));
        result.put("resolved", countBy(SysSodViolation::getHandleStatus, STATUS_RESOLVED));
        result.put("ignored", countBy(SysSodViolation::getHandleStatus, STATUS_IGNORED));
        return result;
    }

    public SysSodViolation require(Long id) {
        SysSodViolation entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "职责分离违规记录不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/时间非空）时覆盖实体对应字段。 */
    private void applyRequest(SysSodViolation entity, SysSodViolationSaveRequest request) {
        if (StringUtils.hasText(request.getRuleNo())) {
            entity.setRuleNo(request.getRuleNo());
        }
        if (StringUtils.hasText(request.getRuleName())) {
            entity.setRuleName(request.getRuleName());
        }
        if (request.getUserId() != null) {
            entity.setUserId(request.getUserId());
        }
        if (StringUtils.hasText(request.getUsername())) {
            entity.setUsername(request.getUsername());
        }
        if (StringUtils.hasText(request.getConflictDetail())) {
            entity.setConflictDetail(request.getConflictDetail());
        }
        if (StringUtils.hasText(request.getRiskLevel())) {
            entity.setRiskLevel(request.getRiskLevel());
        }
        if (StringUtils.hasText(request.getHandleStatus())) {
            entity.setHandleStatus(request.getHandleStatus());
        }
        if (StringUtils.hasText(request.getHandler())) {
            entity.setHandler(request.getHandler());
        }
        if (request.getHandleTime() != null) {
            entity.setHandleTime(request.getHandleTime());
        }
        if (StringUtils.hasText(request.getHandleNote())) {
            entity.setHandleNote(request.getHandleNote());
        }
        if (request.getDetectTime() != null) {
            entity.setDetectTime(request.getDetectTime());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private SysSodViolation changeHandleStatus(Long id, String handleStatus) {
        SysSodViolation entity = require(id);
        entity.setHandleStatus(handleStatus);
        entity.setHandleTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    private Long countBy(SFunction<SysSodViolation, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysSodViolation>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
