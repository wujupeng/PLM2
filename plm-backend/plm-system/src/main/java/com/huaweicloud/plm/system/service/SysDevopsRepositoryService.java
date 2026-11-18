package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.DevopsRepositoryQuery;
import com.huaweicloud.plm.system.dto.DevopsRepositorySaveRequest;
import com.huaweicloud.plm.system.entity.SysDevopsRepository;
import com.huaweicloud.plm.system.mapper.SysDevopsRepositoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 代码仓库（G1-N7 公共平台底座—DevSecOps WBS T012）：
 * 仓库登记、分页查询与删除。
 * 仓库编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysDevopsRepositoryService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String DEFAULT_REPO_TYPE = "GIT";
    private static final String DEFAULT_BRANCH_STRATEGY = "GITFLOW";

    private final SysDevopsRepositoryMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询仓库：类型/分支策略/系统域/状态精确，编号/编码/名称/地址模糊，按 id 倒序。 */
    public PageResult<SysDevopsRepository> pageRepositories(DevopsRepositoryQuery query) {
        Page<SysDevopsRepository> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysDevopsRepository>lambdaQuery()
                .eq(StringUtils.hasText(query.getRepoType()),
                        SysDevopsRepository::getRepoType, query.getRepoType())
                .eq(StringUtils.hasText(query.getBranchStrategy()),
                        SysDevopsRepository::getBranchStrategy, query.getBranchStrategy())
                .eq(StringUtils.hasText(query.getSystemDomain()),
                        SysDevopsRepository::getSystemDomain, query.getSystemDomain())
                .eq(StringUtils.hasText(query.getRepoStatus()),
                        SysDevopsRepository::getRepoStatus, query.getRepoStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysDevopsRepository::getRepoNo, query.getKeyword()).or()
                        .like(SysDevopsRepository::getRepoCode, query.getKeyword()).or()
                        .like(SysDevopsRepository::getRepoName, query.getKeyword()).or()
                        .like(SysDevopsRepository::getRepoUrl, query.getKeyword()))
                .orderByDesc(SysDevopsRepository::getId));
        return PageResult.of(page);
    }

    public SysDevopsRepository detail(Long id) {
        return require(id);
    }

    /** 新增或更新仓库：新增时回填默认类型/分支策略/状态与组织，仓库编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, DevopsRepositorySaveRequest request) {
        SysDevopsRepository entity;
        if (id == null) {
            entity = new SysDevopsRepository();
            entity.setRepoNo(StringUtils.hasText(request.getRepoNo())
                    ? request.getRepoNo() : flowSupport.nextBizNo("DRP"));
            entity.setRepoType(StringUtils.hasText(request.getRepoType())
                    ? request.getRepoType() : DEFAULT_REPO_TYPE);
            entity.setBranchStrategy(StringUtils.hasText(request.getBranchStrategy())
                    ? request.getBranchStrategy() : DEFAULT_BRANCH_STRATEGY);
            entity.setRepoStatus(StringUtils.hasText(request.getRepoStatus())
                    ? request.getRepoStatus() : STATUS_ACTIVE);
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

    /** 删除仓库：物理删除以释放仓库编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysDevopsRepository require(Long id) {
        SysDevopsRepository entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "代码仓库不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空）时覆盖实体对应字段。 */
    private void applyRequest(SysDevopsRepository entity, DevopsRepositorySaveRequest request) {
        if (StringUtils.hasText(request.getRepoNo())) {
            entity.setRepoNo(request.getRepoNo());
        }
        if (StringUtils.hasText(request.getRepoCode())) {
            entity.setRepoCode(request.getRepoCode());
        }
        if (StringUtils.hasText(request.getRepoName())) {
            entity.setRepoName(request.getRepoName());
        }
        if (StringUtils.hasText(request.getRepoType())) {
            entity.setRepoType(request.getRepoType());
        }
        if (StringUtils.hasText(request.getRepoUrl())) {
            entity.setRepoUrl(request.getRepoUrl());
        }
        if (StringUtils.hasText(request.getBranchStrategy())) {
            entity.setBranchStrategy(request.getBranchStrategy());
        }
        if (StringUtils.hasText(request.getSystemDomain())) {
            entity.setSystemDomain(request.getSystemDomain());
        }
        if (StringUtils.hasText(request.getOwnerName())) {
            entity.setOwnerName(request.getOwnerName());
        }
        if (StringUtils.hasText(request.getRepoStatus())) {
            entity.setRepoStatus(request.getRepoStatus());
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
