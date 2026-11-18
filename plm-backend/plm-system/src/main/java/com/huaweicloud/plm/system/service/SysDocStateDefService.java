package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.DocStateQuery;
import com.huaweicloud.plm.system.dto.SysDocStateDefSaveRequest;
import com.huaweicloud.plm.system.entity.SysDocStateDef;
import com.huaweicloud.plm.system.mapper.SysDocStateDefMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 单据状态定义（G1-N6 公共平台底座—通用能力 WBS T102 单据状态机）：
 * 状态定义登记、启停状态流转与统计。
 * 「单据类型 + 状态编码」存在硬唯一索引，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysDocStateDefService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";
    private static final String STATE_TYPE_DRAFT = "DRAFT";

    private final SysDocStateDefMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询单据状态定义：单据类型/状态编码/状态类型/状态状态精确，时间区间作用于创建时间。 */
    public PageResult<SysDocStateDef> pageStateDefs(DocStateQuery query) {
        Page<SysDocStateDef> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysDocStateDef>lambdaQuery()
                .eq(StringUtils.hasText(query.getDocType()),
                        SysDocStateDef::getDocType, query.getDocType())
                .eq(StringUtils.hasText(query.getStateCode()),
                        SysDocStateDef::getStateCode, query.getStateCode())
                .eq(StringUtils.hasText(query.getStateType()),
                        SysDocStateDef::getStateType, query.getStateType())
                .eq(StringUtils.hasText(query.getStateStatus()),
                        SysDocStateDef::getStateStatus, query.getStateStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysDocStateDef::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysDocStateDef::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysDocStateDef::getDocType, query.getKeyword()).or()
                        .like(SysDocStateDef::getStateCode, query.getKeyword()).or()
                        .like(SysDocStateDef::getStateName, query.getKeyword()))
                .orderByAsc(SysDocStateDef::getSortNo)
                .orderByDesc(SysDocStateDef::getId));
        return PageResult.of(page);
    }

    public SysDocStateDef detail(Long id) {
        return require(id);
    }

    /** 新增或更新单据状态定义：新增时回填默认状态类型/状态状态/数值默认值与组织，状态编码为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysDocStateDefSaveRequest request) {
        SysDocStateDef entity;
        if (id == null) {
            entity = new SysDocStateDef();
            entity.setStateCode(StringUtils.hasText(request.getStateCode())
                    ? request.getStateCode() : flowSupport.nextBizNo("DSD"));
            entity.setStateType(StringUtils.hasText(request.getStateType())
                    ? request.getStateType() : STATE_TYPE_DRAFT);
            entity.setStateStatus(StringUtils.hasText(request.getStateStatus())
                    ? request.getStateStatus() : STATUS_ACTIVE);
            entity.setIsInitial(defaultInt(request.getIsInitial()));
            entity.setIsFinal(defaultInt(request.getIsFinal()));
            entity.setAllowEdit(defaultInt(request.getAllowEdit()));
            entity.setAllowDelete(defaultInt(request.getAllowDelete()));
            entity.setSortNo(defaultInt(request.getSortNo()));
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

    /** 启用：状态置为 ACTIVE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysDocStateDef enable(Long id) {
        return changeStateStatus(id, STATUS_ACTIVE);
    }

    /** 停用：状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysDocStateDef disable(Long id) {
        return changeStateStatus(id, STATUS_DISABLED);
    }

    /** 删除单据状态定义：物理删除以释放「单据类型 + 状态编码」唯一键。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 单据状态定义统计：按状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("active", countBy(SysDocStateDef::getStateStatus, STATUS_ACTIVE));
        result.put("disabled", countBy(SysDocStateDef::getStateStatus, STATUS_DISABLED));
        return result;
    }

    public SysDocStateDef require(Long id) {
        SysDocStateDef entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "单据状态定义不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值时覆盖实体对应字段（字符串非空、数值非 null）。 */
    private void applyRequest(SysDocStateDef entity, SysDocStateDefSaveRequest request) {
        if (StringUtils.hasText(request.getDocType())) {
            entity.setDocType(request.getDocType());
        }
        if (StringUtils.hasText(request.getStateCode())) {
            entity.setStateCode(request.getStateCode());
        }
        if (StringUtils.hasText(request.getStateName())) {
            entity.setStateName(request.getStateName());
        }
        if (StringUtils.hasText(request.getStateType())) {
            entity.setStateType(request.getStateType());
        }
        if (request.getIsInitial() != null) {
            entity.setIsInitial(request.getIsInitial());
        }
        if (request.getIsFinal() != null) {
            entity.setIsFinal(request.getIsFinal());
        }
        if (request.getAllowEdit() != null) {
            entity.setAllowEdit(request.getAllowEdit());
        }
        if (request.getAllowDelete() != null) {
            entity.setAllowDelete(request.getAllowDelete());
        }
        if (request.getSortNo() != null) {
            entity.setSortNo(request.getSortNo());
        }
        if (StringUtils.hasText(request.getStateStatus())) {
            entity.setStateStatus(request.getStateStatus());
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

    private SysDocStateDef changeStateStatus(Long id, String stateStatus) {
        SysDocStateDef entity = require(id);
        entity.setStateStatus(stateStatus);
        mapper.updateById(entity);
        return entity;
    }

    private int defaultInt(Integer value) {
        return value == null ? 0 : value;
    }

    private Long countBy(SFunction<SysDocStateDef, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysDocStateDef>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
