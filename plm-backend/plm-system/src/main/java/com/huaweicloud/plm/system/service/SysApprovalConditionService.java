package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ApprovalConditionQuery;
import com.huaweicloud.plm.system.dto.SysApprovalConditionSaveRequest;
import com.huaweicloud.plm.system.entity.SysApprovalCondition;
import com.huaweicloud.plm.system.mapper.SysApprovalConditionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 审批条件（G1-N6 公共平台底座—通用能力 WBS T103 可配置审批）：
 * 条件登记、启停状态流转与统计。
 * 条件编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysApprovalConditionService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";

    private static final String DEFAULT_OPERATOR = "EQ";
    private static final String DEFAULT_LOGIC = "AND";

    private final SysApprovalConditionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询审批条件：流程编码/字段/比较符/逻辑连接/条件状态精确，时间区间作用于创建时间。 */
    public PageResult<SysApprovalCondition> pageConditions(ApprovalConditionQuery query) {
        Page<SysApprovalCondition> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysApprovalCondition>lambdaQuery()
                .eq(StringUtils.hasText(query.getFlowCode()),
                        SysApprovalCondition::getFlowCode, query.getFlowCode())
                .eq(StringUtils.hasText(query.getFieldKey()),
                        SysApprovalCondition::getFieldKey, query.getFieldKey())
                .eq(StringUtils.hasText(query.getCompareOperator()),
                        SysApprovalCondition::getCompareOperator, query.getCompareOperator())
                .eq(StringUtils.hasText(query.getLogicType()),
                        SysApprovalCondition::getLogicType, query.getLogicType())
                .eq(StringUtils.hasText(query.getConditionStatus()),
                        SysApprovalCondition::getConditionStatus, query.getConditionStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysApprovalCondition::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysApprovalCondition::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysApprovalCondition::getConditionNo, query.getKeyword()).or()
                        .like(SysApprovalCondition::getFlowCode, query.getKeyword()).or()
                        .like(SysApprovalCondition::getFieldKey, query.getKeyword()))
                .orderByDesc(SysApprovalCondition::getId));
        return PageResult.of(page);
    }

    public SysApprovalCondition detail(Long id) {
        return require(id);
    }

    /** 新增或更新审批条件：新增时回填默认顺序/比较符/逻辑连接/条件状态与组织，条件编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysApprovalConditionSaveRequest request) {
        SysApprovalCondition entity;
        if (id == null) {
            entity = new SysApprovalCondition();
            entity.setConditionNo(StringUtils.hasText(request.getConditionNo())
                    ? request.getConditionNo() : flowSupport.nextBizNo("APC"));
            entity.setSeqNo(defaultInt(request.getSeqNo()));
            entity.setCompareOperator(StringUtils.hasText(request.getCompareOperator())
                    ? request.getCompareOperator() : DEFAULT_OPERATOR);
            entity.setLogicType(StringUtils.hasText(request.getLogicType())
                    ? request.getLogicType() : DEFAULT_LOGIC);
            entity.setConditionStatus(StringUtils.hasText(request.getConditionStatus())
                    ? request.getConditionStatus() : STATUS_ACTIVE);
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

    /** 启用：条件状态置为 ACTIVE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysApprovalCondition enable(Long id) {
        return changeConditionStatus(id, STATUS_ACTIVE);
    }

    /** 停用：条件状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysApprovalCondition disable(Long id) {
        return changeConditionStatus(id, STATUS_DISABLED);
    }

    /** 删除审批条件：物理删除以释放条件编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 审批条件统计：按条件状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("active", countBy(SysApprovalCondition::getConditionStatus, STATUS_ACTIVE));
        result.put("disabled", countBy(SysApprovalCondition::getConditionStatus, STATUS_DISABLED));
        return result;
    }

    public SysApprovalCondition require(Long id) {
        SysApprovalCondition entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "审批条件不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysApprovalCondition entity, SysApprovalConditionSaveRequest request) {
        if (StringUtils.hasText(request.getConditionNo())) {
            entity.setConditionNo(request.getConditionNo());
        }
        if (StringUtils.hasText(request.getFlowCode())) {
            entity.setFlowCode(request.getFlowCode());
        }
        if (request.getSeqNo() != null) {
            entity.setSeqNo(request.getSeqNo());
        }
        if (StringUtils.hasText(request.getFieldKey())) {
            entity.setFieldKey(request.getFieldKey());
        }
        if (StringUtils.hasText(request.getCompareOperator())) {
            entity.setCompareOperator(request.getCompareOperator());
        }
        if (StringUtils.hasText(request.getCompareValue())) {
            entity.setCompareValue(request.getCompareValue());
        }
        if (StringUtils.hasText(request.getLogicType())) {
            entity.setLogicType(request.getLogicType());
        }
        if (StringUtils.hasText(request.getConditionStatus())) {
            entity.setConditionStatus(request.getConditionStatus());
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

    private SysApprovalCondition changeConditionStatus(Long id, String conditionStatus) {
        SysApprovalCondition entity = require(id);
        entity.setConditionStatus(conditionStatus);
        mapper.updateById(entity);
        return entity;
    }

    private int defaultInt(Integer value) {
        return value == null ? 0 : value;
    }

    private Long countBy(SFunction<SysApprovalCondition, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysApprovalCondition>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
