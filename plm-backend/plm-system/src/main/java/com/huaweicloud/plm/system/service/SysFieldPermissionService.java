package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IamQuery;
import com.huaweicloud.plm.system.dto.SysFieldPermissionSaveRequest;
import com.huaweicloud.plm.system.entity.SysFieldPermission;
import com.huaweicloud.plm.system.mapper.SysFieldPermissionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 字段级权限（G1-N4 公共平台底座—身份与权限增强 WBS T008 权限审计）：
 * 字段可见性/脱敏级别登记、启停状态流转与统计。
 * 权限编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysFieldPermissionService {

    private static final String DEFAULT_ACCESS_LEVEL = "HIDDEN";
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";
    private static final String ACCESS_HIDDEN = "HIDDEN";
    private static final String ACCESS_MASKED = "MASKED";

    private final SysFieldPermissionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询字段权限：角色/访问级别/权限状态/业务模块/数据表精确，关键字匹配编号/数据表/字段名，时间区间作用于创建时间。 */
    public PageResult<SysFieldPermission> pagePermissions(IamQuery query) {
        Page<SysFieldPermission> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysFieldPermission>lambdaQuery()
                .eq(StringUtils.hasText(query.getRoleCode()),
                        SysFieldPermission::getRoleCode, query.getRoleCode())
                .eq(StringUtils.hasText(query.getAccessLevel()),
                        SysFieldPermission::getAccessLevel, query.getAccessLevel())
                .eq(StringUtils.hasText(query.getPermStatus()),
                        SysFieldPermission::getPermStatus, query.getPermStatus())
                .eq(StringUtils.hasText(query.getBizModule()),
                        SysFieldPermission::getBizModule, query.getBizModule())
                .eq(StringUtils.hasText(query.getTableName()),
                        SysFieldPermission::getTableName, query.getTableName())
                .ge(StringUtils.hasText(query.getStartDate()), SysFieldPermission::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysFieldPermission::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysFieldPermission::getPermNo, query.getKeyword()).or()
                        .like(SysFieldPermission::getTableName, query.getKeyword()).or()
                        .like(SysFieldPermission::getFieldName, query.getKeyword()))
                .orderByDesc(SysFieldPermission::getId));
        return PageResult.of(page);
    }

    public SysFieldPermission detail(Long id) {
        return require(id);
    }

    /** 新增或更新字段权限：新增时回填默认访问级别与权限状态，并回填组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysFieldPermissionSaveRequest request) {
        SysFieldPermission entity;
        if (id == null) {
            entity = new SysFieldPermission();
            entity.setPermNo(StringUtils.hasText(request.getPermNo())
                    ? request.getPermNo() : flowSupport.nextBizNo("FP"));
            entity.setAccessLevel(DEFAULT_ACCESS_LEVEL);
            entity.setPermStatus(STATUS_ACTIVE);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getPermNo())) {
                entity.setPermNo(request.getPermNo());
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

    /** 启用：权限状态置为 ACTIVE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysFieldPermission enable(Long id) {
        return changePermStatus(id, STATUS_ACTIVE);
    }

    /** 停用：权限状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysFieldPermission disable(Long id) {
        return changePermStatus(id, STATUS_DISABLED);
    }

    /** 删除字段权限：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 字段权限统计：按权限状态与访问级别汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("active", countBy(SysFieldPermission::getPermStatus, STATUS_ACTIVE));
        result.put("disabled", countBy(SysFieldPermission::getPermStatus, STATUS_DISABLED));
        result.put("hiddenCount", countBy(SysFieldPermission::getAccessLevel, ACCESS_HIDDEN));
        result.put("maskedCount", countBy(SysFieldPermission::getAccessLevel, ACCESS_MASKED));
        return result;
    }

    public SysFieldPermission require(Long id) {
        SysFieldPermission entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "字段权限不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空）时覆盖实体对应字段。 */
    private void applyRequest(SysFieldPermission entity, SysFieldPermissionSaveRequest request) {
        if (StringUtils.hasText(request.getRoleCode())) {
            entity.setRoleCode(request.getRoleCode());
        }
        if (StringUtils.hasText(request.getBizModule())) {
            entity.setBizModule(request.getBizModule());
        }
        if (StringUtils.hasText(request.getTableName())) {
            entity.setTableName(request.getTableName());
        }
        if (StringUtils.hasText(request.getFieldName())) {
            entity.setFieldName(request.getFieldName());
        }
        if (StringUtils.hasText(request.getFieldLabel())) {
            entity.setFieldLabel(request.getFieldLabel());
        }
        if (StringUtils.hasText(request.getAccessLevel())) {
            entity.setAccessLevel(request.getAccessLevel());
        }
        if (StringUtils.hasText(request.getMaskRule())) {
            entity.setMaskRule(request.getMaskRule());
        }
        if (StringUtils.hasText(request.getPermStatus())) {
            entity.setPermStatus(request.getPermStatus());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private SysFieldPermission changePermStatus(Long id, String permStatus) {
        SysFieldPermission entity = require(id);
        entity.setPermStatus(permStatus);
        mapper.updateById(entity);
        return entity;
    }

    private Long countBy(SFunction<SysFieldPermission, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysFieldPermission>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
