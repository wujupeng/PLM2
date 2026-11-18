package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.DataQualityExceptionQuery;
import com.huaweicloud.plm.system.dto.SysDataQualityExceptionSaveRequest;
import com.huaweicloud.plm.system.entity.SysDataQualityException;
import com.huaweicloud.plm.system.mapper.SysDataQualityExceptionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 数据异常队列（G1-N6 公共平台底座—通用能力 WBS T105 数据质量控制）：
 * 异常入队登记、处理状态流转（处理中/已解决/已忽略）与统计。
 * 异常编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysDataQualityExceptionService {

    private static final String STATUS_OPEN = "OPEN";
    private static final String STATUS_HANDLING = "HANDLING";
    private static final String STATUS_RESOLVED = "RESOLVED";
    private static final String STATUS_IGNORED = "IGNORED";
    private static final String DEFAULT_ERROR_LEVEL = "ERROR";

    private final SysDataQualityExceptionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询数据异常：规则编码/目标实体/异常级别/处理状态/处理人精确，业务键模糊，时间区间作用于创建时间。 */
    public PageResult<SysDataQualityException> pageExceptions(DataQualityExceptionQuery query) {
        Page<SysDataQualityException> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysDataQualityException>lambdaQuery()
                .eq(StringUtils.hasText(query.getRuleCode()),
                        SysDataQualityException::getRuleCode, query.getRuleCode())
                .eq(StringUtils.hasText(query.getTargetEntity()),
                        SysDataQualityException::getTargetEntity, query.getTargetEntity())
                .like(StringUtils.hasText(query.getRecordKey()),
                        SysDataQualityException::getRecordKey, query.getRecordKey())
                .eq(StringUtils.hasText(query.getErrorLevel()),
                        SysDataQualityException::getErrorLevel, query.getErrorLevel())
                .eq(StringUtils.hasText(query.getExceptionStatus()),
                        SysDataQualityException::getExceptionStatus, query.getExceptionStatus())
                .eq(StringUtils.hasText(query.getHandlerName()),
                        SysDataQualityException::getHandlerName, query.getHandlerName())
                .ge(StringUtils.hasText(query.getStartDate()), SysDataQualityException::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysDataQualityException::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysDataQualityException::getExceptionNo, query.getKeyword()).or()
                        .like(SysDataQualityException::getRuleCode, query.getKeyword()).or()
                        .like(SysDataQualityException::getRecordKey, query.getKeyword()))
                .orderByDesc(SysDataQualityException::getId));
        return PageResult.of(page);
    }

    public SysDataQualityException detail(Long id) {
        return require(id);
    }

    /** 新增或更新数据异常：新增时回填默认异常级别/处理状态与组织，异常编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysDataQualityExceptionSaveRequest request) {
        SysDataQualityException entity;
        if (id == null) {
            entity = new SysDataQualityException();
            entity.setExceptionNo(StringUtils.hasText(request.getExceptionNo())
                    ? request.getExceptionNo() : flowSupport.nextBizNo("DQE"));
            entity.setErrorLevel(StringUtils.hasText(request.getErrorLevel())
                    ? request.getErrorLevel() : DEFAULT_ERROR_LEVEL);
            entity.setExceptionStatus(StringUtils.hasText(request.getExceptionStatus())
                    ? request.getExceptionStatus() : STATUS_OPEN);
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

    /** 处理中：处理状态置为 HANDLING，处理人置为当前用户。 */
    @Transactional(rollbackFor = Exception.class)
    public SysDataQualityException handle(Long id) {
        SysDataQualityException entity = require(id);
        entity.setExceptionStatus(STATUS_HANDLING);
        entity.setHandlerName(currentUserName());
        mapper.updateById(entity);
        return entity;
    }

    /** 已解决：处理状态置为 RESOLVED，记录处理人、处理时间与处理说明。 */
    @Transactional(rollbackFor = Exception.class)
    public SysDataQualityException resolve(Long id, String handleNote) {
        SysDataQualityException entity = require(id);
        entity.setExceptionStatus(STATUS_RESOLVED);
        entity.setHandlerName(currentUserName());
        entity.setHandledTime(LocalDateTime.now());
        if (StringUtils.hasText(handleNote)) {
            entity.setHandleNote(handleNote);
        }
        mapper.updateById(entity);
        return entity;
    }

    /** 已忽略：处理状态置为 IGNORED，记录处理人与处理时间。 */
    @Transactional(rollbackFor = Exception.class)
    public SysDataQualityException ignore(Long id) {
        SysDataQualityException entity = require(id);
        entity.setExceptionStatus(STATUS_IGNORED);
        entity.setHandlerName(currentUserName());
        entity.setHandledTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 删除数据异常：物理删除以释放异常编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 数据异常统计：按处理状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("open", countBy(SysDataQualityException::getExceptionStatus, STATUS_OPEN));
        result.put("handling", countBy(SysDataQualityException::getExceptionStatus, STATUS_HANDLING));
        result.put("resolved", countBy(SysDataQualityException::getExceptionStatus, STATUS_RESOLVED));
        result.put("ignored", countBy(SysDataQualityException::getExceptionStatus, STATUS_IGNORED));
        return result;
    }

    public SysDataQualityException require(Long id) {
        SysDataQualityException entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "数据异常记录不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysDataQualityException entity, SysDataQualityExceptionSaveRequest request) {
        if (StringUtils.hasText(request.getExceptionNo())) {
            entity.setExceptionNo(request.getExceptionNo());
        }
        if (StringUtils.hasText(request.getRuleCode())) {
            entity.setRuleCode(request.getRuleCode());
        }
        if (StringUtils.hasText(request.getTargetEntity())) {
            entity.setTargetEntity(request.getTargetEntity());
        }
        if (request.getRecordId() != null) {
            entity.setRecordId(request.getRecordId());
        }
        if (StringUtils.hasText(request.getRecordKey())) {
            entity.setRecordKey(request.getRecordKey());
        }
        if (StringUtils.hasText(request.getErrorLevel())) {
            entity.setErrorLevel(request.getErrorLevel());
        }
        if (StringUtils.hasText(request.getErrorMessage())) {
            entity.setErrorMessage(request.getErrorMessage());
        }
        if (StringUtils.hasText(request.getExceptionStatus())) {
            entity.setExceptionStatus(request.getExceptionStatus());
        }
        if (StringUtils.hasText(request.getHandlerName())) {
            entity.setHandlerName(request.getHandlerName());
        }
        if (StringUtils.hasText(request.getHandleNote())) {
            entity.setHandleNote(request.getHandleNote());
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

    private Long countBy(SFunction<SysDataQualityException, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysDataQualityException>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }

    /** 当前用户名称：优先展示名，缺失时回退登录名。 */
    private String currentUserName() {
        UserContext.Principal principal = UserContext.get();
        if (principal == null) {
            return null;
        }
        return StringUtils.hasText(principal.displayName()) ? principal.displayName() : principal.username();
    }
}
