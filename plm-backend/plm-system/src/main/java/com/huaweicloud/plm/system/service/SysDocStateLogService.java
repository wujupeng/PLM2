package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.DocStateLogQuery;
import com.huaweicloud.plm.system.dto.SysDocStateLogSaveRequest;
import com.huaweicloud.plm.system.entity.SysDocStateLog;
import com.huaweicloud.plm.system.mapper.SysDocStateLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 单据状态流转日志（G1-N6 公共平台底座—通用能力 WBS T102 单据状态机）：
 * 记录单据每一次状态变更轨迹（含操作人、时间、原因），供审计追踪与问题定位。
 * 日志编号存在硬唯一索引，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysDocStateLogService {

    private final SysDocStateLogMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询流转日志：单据类型/单据号/目标状态/动作精确，操作人姓名模糊，时间区间作用于操作时间。 */
    public PageResult<SysDocStateLog> pageLogs(DocStateLogQuery query) {
        Page<SysDocStateLog> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysDocStateLog>lambdaQuery()
                .eq(StringUtils.hasText(query.getDocType()),
                        SysDocStateLog::getDocType, query.getDocType())
                .eq(StringUtils.hasText(query.getDocNo()),
                        SysDocStateLog::getDocNo, query.getDocNo())
                .eq(StringUtils.hasText(query.getToState()),
                        SysDocStateLog::getToState, query.getToState())
                .eq(StringUtils.hasText(query.getActionCode()),
                        SysDocStateLog::getActionCode, query.getActionCode())
                .like(StringUtils.hasText(query.getOperatorName()),
                        SysDocStateLog::getOperatorName, query.getOperatorName())
                .ge(StringUtils.hasText(query.getStartDate()), SysDocStateLog::getOperateTime,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysDocStateLog::getOperateTime,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysDocStateLog::getLogNo, query.getKeyword()).or()
                        .like(SysDocStateLog::getDocType, query.getKeyword()).or()
                        .like(SysDocStateLog::getDocNo, query.getKeyword()).or()
                        .like(SysDocStateLog::getBizTitle, query.getKeyword()))
                .orderByDesc(SysDocStateLog::getOperateTime)
                .orderByDesc(SysDocStateLog::getId));
        return PageResult.of(page);
    }

    public SysDocStateLog detail(Long id) {
        return require(id);
    }

    /** 新增或更新流转日志：新增时回填日志编号、操作时间、操作人与组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysDocStateLogSaveRequest request) {
        SysDocStateLog entity;
        if (id == null) {
            entity = new SysDocStateLog();
            entity.setLogNo(StringUtils.hasText(request.getLogNo())
                    ? request.getLogNo() : flowSupport.nextBizNo("DSL"));
            entity.setOperateTime(request.getOperateTime() != null
                    ? request.getOperateTime() : LocalDateTime.now());
            UserContext.Principal principal = UserContext.get();
            entity.setOperatorId(request.getOperatorId() != null
                    ? request.getOperatorId() : (principal == null ? null : principal.userId()));
            entity.setOperatorName(StringUtils.hasText(request.getOperatorName())
                    ? request.getOperatorName() : currentOperatorName(principal));
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

    /** 删除流转日志：物理删除以释放日志编号唯一键。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 流转日志统计：总数与涉及的单据类型去重数。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        Long docTypeCount = mapper.countDistinctDocType();
        result.put("docTypeCount", docTypeCount == null ? 0L : docTypeCount);
        return result;
    }

    public SysDocStateLog require(Long id) {
        SysDocStateLog entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "单据状态流转日志不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值时覆盖实体对应字段（字符串非空、数值非 null）。 */
    private void applyRequest(SysDocStateLog entity, SysDocStateLogSaveRequest request) {
        if (StringUtils.hasText(request.getLogNo())) {
            entity.setLogNo(request.getLogNo());
        }
        if (StringUtils.hasText(request.getDocType())) {
            entity.setDocType(request.getDocType());
        }
        if (StringUtils.hasText(request.getDocNo())) {
            entity.setDocNo(request.getDocNo());
        }
        if (StringUtils.hasText(request.getBizTitle())) {
            entity.setBizTitle(request.getBizTitle());
        }
        if (StringUtils.hasText(request.getFromState())) {
            entity.setFromState(request.getFromState());
        }
        if (StringUtils.hasText(request.getToState())) {
            entity.setToState(request.getToState());
        }
        if (StringUtils.hasText(request.getActionCode())) {
            entity.setActionCode(request.getActionCode());
        }
        if (StringUtils.hasText(request.getActionName())) {
            entity.setActionName(request.getActionName());
        }
        if (StringUtils.hasText(request.getReason())) {
            entity.setReason(request.getReason());
        }
        if (request.getOperatorId() != null) {
            entity.setOperatorId(request.getOperatorId());
        }
        if (StringUtils.hasText(request.getOperatorName())) {
            entity.setOperatorName(request.getOperatorName());
        }
        if (request.getOperateTime() != null) {
            entity.setOperateTime(request.getOperateTime());
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

    private String currentOperatorName(UserContext.Principal principal) {
        if (principal == null) {
            return null;
        }
        return StringUtils.hasText(principal.displayName()) ? principal.displayName() : principal.username();
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
