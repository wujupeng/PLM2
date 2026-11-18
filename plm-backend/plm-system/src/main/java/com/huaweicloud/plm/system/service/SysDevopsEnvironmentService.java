package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.DevopsEnvironmentQuery;
import com.huaweicloud.plm.system.dto.DevopsEnvironmentSaveRequest;
import com.huaweicloud.plm.system.entity.SysDevopsEnvironment;
import com.huaweicloud.plm.system.mapper.SysDevopsEnvironmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 环境（G1-N7 公共平台底座—DevSecOps WBS T012）：
 * 环境登记、分页查询与删除。
 * 环境编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysDevopsEnvironmentService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String DEFAULT_ENV_TYPE = "DEV";
    private static final int DEFAULT_ISOLATED = 1;

    private final SysDevopsEnvironmentMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询环境：类型/状态精确，编号/编码/名称模糊，按 id 倒序。 */
    public PageResult<SysDevopsEnvironment> pageEnvironments(DevopsEnvironmentQuery query) {
        Page<SysDevopsEnvironment> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysDevopsEnvironment>lambdaQuery()
                .eq(StringUtils.hasText(query.getEnvType()),
                        SysDevopsEnvironment::getEnvType, query.getEnvType())
                .eq(StringUtils.hasText(query.getEnvStatus()),
                        SysDevopsEnvironment::getEnvStatus, query.getEnvStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysDevopsEnvironment::getEnvNo, query.getKeyword()).or()
                        .like(SysDevopsEnvironment::getEnvCode, query.getKeyword()).or()
                        .like(SysDevopsEnvironment::getEnvName, query.getKeyword()))
                .orderByDesc(SysDevopsEnvironment::getId));
        return PageResult.of(page);
    }

    public SysDevopsEnvironment detail(Long id) {
        return require(id);
    }

    /** 新增或更新环境：新增时回填默认类型/隔离/状态与组织，环境编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, DevopsEnvironmentSaveRequest request) {
        SysDevopsEnvironment entity;
        if (id == null) {
            entity = new SysDevopsEnvironment();
            entity.setEnvNo(StringUtils.hasText(request.getEnvNo())
                    ? request.getEnvNo() : flowSupport.nextBizNo("DEN"));
            entity.setEnvType(StringUtils.hasText(request.getEnvType())
                    ? request.getEnvType() : DEFAULT_ENV_TYPE);
            entity.setIsolated(request.getIsolated() == null
                    ? DEFAULT_ISOLATED : request.getIsolated());
            entity.setEnvStatus(StringUtils.hasText(request.getEnvStatus())
                    ? request.getEnvStatus() : STATUS_ACTIVE);
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

    /** 删除环境：物理删除以释放环境编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysDevopsEnvironment require(Long id) {
        SysDevopsEnvironment entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "环境不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysDevopsEnvironment entity, DevopsEnvironmentSaveRequest request) {
        if (StringUtils.hasText(request.getEnvNo())) {
            entity.setEnvNo(request.getEnvNo());
        }
        if (StringUtils.hasText(request.getEnvCode())) {
            entity.setEnvCode(request.getEnvCode());
        }
        if (StringUtils.hasText(request.getEnvName())) {
            entity.setEnvName(request.getEnvName());
        }
        if (StringUtils.hasText(request.getEnvType())) {
            entity.setEnvType(request.getEnvType());
        }
        if (StringUtils.hasText(request.getDeployTarget())) {
            entity.setDeployTarget(request.getDeployTarget());
        }
        if (request.getIsolated() != null) {
            entity.setIsolated(request.getIsolated());
        }
        if (StringUtils.hasText(request.getOwnerName())) {
            entity.setOwnerName(request.getOwnerName());
        }
        if (StringUtils.hasText(request.getEnvStatus())) {
            entity.setEnvStatus(request.getEnvStatus());
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

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
