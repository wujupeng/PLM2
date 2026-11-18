package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizRuleParamQuery;
import com.huaweicloud.plm.system.dto.SysBizRuleParamSaveRequest;
import com.huaweicloud.plm.system.entity.SysBizRuleParam;
import com.huaweicloud.plm.system.mapper.SysBizRuleParamMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 规则参数（G1-N6 公共平台底座—通用能力 WBS T104 业务规则引擎）：
 * 规则参数登记、启停状态流转与统计。
 * 参数编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysBizRuleParamService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";

    private static final String DEFAULT_VALUE_TYPE = "STRING";
    private static final int DEFAULT_SEQ_NO = 0;

    private final SysBizRuleParamMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询规则参数：规则编码/参数键/值类型/状态精确，时间区间作用于创建时间。 */
    public PageResult<SysBizRuleParam> pageParams(BizRuleParamQuery query) {
        Page<SysBizRuleParam> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysBizRuleParam>lambdaQuery()
                .eq(StringUtils.hasText(query.getRuleCode()),
                        SysBizRuleParam::getRuleCode, query.getRuleCode())
                .like(StringUtils.hasText(query.getParamKey()),
                        SysBizRuleParam::getParamKey, query.getParamKey())
                .eq(StringUtils.hasText(query.getValueType()),
                        SysBizRuleParam::getValueType, query.getValueType())
                .eq(StringUtils.hasText(query.getParamStatus()),
                        SysBizRuleParam::getParamStatus, query.getParamStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysBizRuleParam::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysBizRuleParam::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysBizRuleParam::getParamNo, query.getKeyword()).or()
                        .like(SysBizRuleParam::getRuleCode, query.getKeyword()).or()
                        .like(SysBizRuleParam::getParamKey, query.getKeyword()).or()
                        .like(SysBizRuleParam::getParamName, query.getKeyword()))
                .orderByDesc(SysBizRuleParam::getId));
        return PageResult.of(page);
    }

    public SysBizRuleParam detail(Long id) {
        return require(id);
    }

    /** 新增或更新规则参数：新增时回填默认值类型/排序号/参数状态与组织，参数编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysBizRuleParamSaveRequest request) {
        SysBizRuleParam entity;
        if (id == null) {
            entity = new SysBizRuleParam();
            entity.setParamNo(StringUtils.hasText(request.getParamNo())
                    ? request.getParamNo() : flowSupport.nextBizNo("BRP"));
            entity.setValueType(StringUtils.hasText(request.getValueType())
                    ? request.getValueType() : DEFAULT_VALUE_TYPE);
            entity.setSeqNo(request.getSeqNo() == null ? DEFAULT_SEQ_NO : request.getSeqNo());
            entity.setParamStatus(StringUtils.hasText(request.getParamStatus())
                    ? request.getParamStatus() : STATUS_ACTIVE);
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

    /** 启用：参数状态置为 ACTIVE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysBizRuleParam enable(Long id) {
        return changeParamStatus(id, STATUS_ACTIVE);
    }

    /** 停用：参数状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysBizRuleParam disable(Long id) {
        return changeParamStatus(id, STATUS_DISABLED);
    }

    /** 删除规则参数：物理删除以释放参数编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 规则参数统计：按参数状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("active", countBy(SysBizRuleParam::getParamStatus, STATUS_ACTIVE));
        result.put("disabled", countBy(SysBizRuleParam::getParamStatus, STATUS_DISABLED));
        return result;
    }

    public SysBizRuleParam require(Long id) {
        SysBizRuleParam entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "规则参数不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysBizRuleParam entity, SysBizRuleParamSaveRequest request) {
        if (StringUtils.hasText(request.getParamNo())) {
            entity.setParamNo(request.getParamNo());
        }
        if (StringUtils.hasText(request.getRuleCode())) {
            entity.setRuleCode(request.getRuleCode());
        }
        if (StringUtils.hasText(request.getParamKey())) {
            entity.setParamKey(request.getParamKey());
        }
        if (StringUtils.hasText(request.getParamName())) {
            entity.setParamName(request.getParamName());
        }
        if (request.getParamValue() != null) {
            entity.setParamValue(request.getParamValue());
        }
        if (StringUtils.hasText(request.getValueType())) {
            entity.setValueType(request.getValueType());
        }
        if (request.getSeqNo() != null) {
            entity.setSeqNo(request.getSeqNo());
        }
        if (StringUtils.hasText(request.getParamStatus())) {
            entity.setParamStatus(request.getParamStatus());
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

    private SysBizRuleParam changeParamStatus(Long id, String paramStatus) {
        SysBizRuleParam entity = require(id);
        entity.setParamStatus(paramStatus);
        mapper.updateById(entity);
        return entity;
    }

    private Long countBy(SFunction<SysBizRuleParam, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysBizRuleParam>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
