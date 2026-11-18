package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OrgQuery;
import com.huaweicloud.plm.system.dto.SysOrgGrantSaveRequest;
import com.huaweicloud.plm.system.entity.SysOrgGrant;
import com.huaweicloud.plm.system.mapper.SysOrgGrantMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 跨组织授权（G1-N5 公共平台底座—多组织多工厂 WBS T100）：
 * 授权关系登记、撤销/过期状态流转与统计。
 * 授权编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysOrgGrantService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_EXPIRED = "EXPIRED";
    private static final String STATUS_REVOKED = "REVOKED";

    private final SysOrgGrantMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询跨组织授权：授权类型/授权状态/作用范围类型精确，关键字匹配编号/被授权方/授权方编码，时间区间作用于创建时间。 */
    public PageResult<SysOrgGrant> pageOrgGrants(OrgQuery query) {
        Page<SysOrgGrant> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysOrgGrant>lambdaQuery()
                .eq(StringUtils.hasText(query.getGrantType()),
                        SysOrgGrant::getGrantType, query.getGrantType())
                .eq(StringUtils.hasText(query.getGrantStatus()),
                        SysOrgGrant::getGrantStatus, query.getGrantStatus())
                .eq(StringUtils.hasText(query.getScopeType()),
                        SysOrgGrant::getScopeType, query.getScopeType())
                .ge(StringUtils.hasText(query.getStartDate()), SysOrgGrant::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysOrgGrant::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysOrgGrant::getGrantNo, query.getKeyword()).or()
                        .like(SysOrgGrant::getGranteeName, query.getKeyword()).or()
                        .like(SysOrgGrant::getGrantorCode, query.getKeyword()))
                .orderByDesc(SysOrgGrant::getId));
        return PageResult.of(page);
    }

    public SysOrgGrant detail(Long id) {
        return require(id);
    }

    /** 新增或更新跨组织授权：新增时回填默认授权状态与组织，授权编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysOrgGrantSaveRequest request) {
        SysOrgGrant entity;
        if (id == null) {
            entity = new SysOrgGrant();
            entity.setGrantNo(StringUtils.hasText(request.getGrantNo())
                    ? request.getGrantNo() : flowSupport.nextBizNo("OG"));
            entity.setGrantStatus(STATUS_ACTIVE);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getGrantNo())) {
                entity.setGrantNo(request.getGrantNo());
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

    /** 撤销：授权状态置为 REVOKED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysOrgGrant revoke(Long id) {
        return changeGrantStatus(id, STATUS_REVOKED);
    }

    /** 过期：授权状态置为 EXPIRED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysOrgGrant expire(Long id) {
        return changeGrantStatus(id, STATUS_EXPIRED);
    }

    /** 删除跨组织授权：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 跨组织授权统计：按授权状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("active", countBy(SysOrgGrant::getGrantStatus, STATUS_ACTIVE));
        result.put("expired", countBy(SysOrgGrant::getGrantStatus, STATUS_EXPIRED));
        result.put("revoked", countBy(SysOrgGrant::getGrantStatus, STATUS_REVOKED));
        return result;
    }

    public SysOrgGrant require(Long id) {
        SysOrgGrant entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "跨组织授权不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/时间非空）时覆盖实体对应字段。 */
    private void applyRequest(SysOrgGrant entity, SysOrgGrantSaveRequest request) {
        if (StringUtils.hasText(request.getGrantNo())) {
            entity.setGrantNo(request.getGrantNo());
        }
        if (StringUtils.hasText(request.getGrantType())) {
            entity.setGrantType(request.getGrantType());
        }
        if (StringUtils.hasText(request.getGrantorCode())) {
            entity.setGrantorCode(request.getGrantorCode());
        }
        if (request.getGranteeOrgId() != null) {
            entity.setGranteeOrgId(request.getGranteeOrgId());
        }
        if (StringUtils.hasText(request.getGranteeName())) {
            entity.setGranteeName(request.getGranteeName());
        }
        if (StringUtils.hasText(request.getScopeType())) {
            entity.setScopeType(request.getScopeType());
        }
        if (StringUtils.hasText(request.getScopeValue())) {
            entity.setScopeValue(request.getScopeValue());
        }
        if (request.getEffectiveDate() != null) {
            entity.setEffectiveDate(request.getEffectiveDate());
        }
        if (request.getExpireDate() != null) {
            entity.setExpireDate(request.getExpireDate());
        }
        if (StringUtils.hasText(request.getGrantStatus())) {
            entity.setGrantStatus(request.getGrantStatus());
        }
        if (StringUtils.hasText(request.getGrantReason())) {
            entity.setGrantReason(request.getGrantReason());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private SysOrgGrant changeGrantStatus(Long id, String grantStatus) {
        SysOrgGrant entity = require(id);
        entity.setGrantStatus(grantStatus);
        mapper.updateById(entity);
        return entity;
    }

    private Long countBy(SFunction<SysOrgGrant, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysOrgGrant>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
