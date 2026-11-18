package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SysGovProjectQuery;
import com.huaweicloud.plm.system.dto.SysGovProjectSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovProject;
import com.huaweicloud.plm.system.mapper.SysGovProjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 治理中心—项目治理（G1-N7 公共平台底座 WBS T001 项目治理）：
 * 项目登记、分页查询与删除。
 * 项目编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysGovProjectService {

    private static final String DEFAULT_PROJECT_TYPE = "PLATFORM";
    private static final String DEFAULT_PROJECT_STATUS = "PLANNING";

    private final SysGovProjectMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询项目：类型/状态精确，编号/编码/名称模糊，按主键倒序。 */
    public PageResult<SysGovProject> pageProjects(SysGovProjectQuery query) {
        Page<SysGovProject> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysGovProject>lambdaQuery()
                .eq(StringUtils.hasText(query.getProjectType()),
                        SysGovProject::getProjectType, query.getProjectType())
                .eq(StringUtils.hasText(query.getProjectStatus()),
                        SysGovProject::getProjectStatus, query.getProjectStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysGovProject::getProjectNo, query.getKeyword()).or()
                        .like(SysGovProject::getProjectCode, query.getKeyword()).or()
                        .like(SysGovProject::getProjectName, query.getKeyword()))
                .orderByDesc(SysGovProject::getId));
        return PageResult.of(page);
    }

    public SysGovProject detail(Long id) {
        return require(id);
    }

    /** 新增或更新项目：新增时回填默认类型/状态与组织，项目编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysGovProjectSaveRequest request) {
        SysGovProject entity;
        if (id == null) {
            entity = new SysGovProject();
            entity.setProjectNo(StringUtils.hasText(request.getProjectNo())
                    ? request.getProjectNo() : flowSupport.nextBizNo("GPRJ"));
            entity.setProjectType(StringUtils.hasText(request.getProjectType())
                    ? request.getProjectType() : DEFAULT_PROJECT_TYPE);
            entity.setProjectStatus(StringUtils.hasText(request.getProjectStatus())
                    ? request.getProjectStatus() : DEFAULT_PROJECT_STATUS);
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

    /** 删除项目：物理删除以释放项目编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysGovProject require(Long id) {
        SysGovProject entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "治理项目不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysGovProject entity, SysGovProjectSaveRequest request) {
        if (StringUtils.hasText(request.getProjectNo())) {
            entity.setProjectNo(request.getProjectNo());
        }
        if (StringUtils.hasText(request.getProjectCode())) {
            entity.setProjectCode(request.getProjectCode());
        }
        if (StringUtils.hasText(request.getProjectName())) {
            entity.setProjectName(request.getProjectName());
        }
        if (StringUtils.hasText(request.getProjectType())) {
            entity.setProjectType(request.getProjectType());
        }
        if (StringUtils.hasText(request.getSponsor())) {
            entity.setSponsor(request.getSponsor());
        }
        if (StringUtils.hasText(request.getManagerName())) {
            entity.setManagerName(request.getManagerName());
        }
        if (request.getStartDate() != null) {
            entity.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            entity.setEndDate(request.getEndDate());
        }
        if (StringUtils.hasText(request.getProjectStatus())) {
            entity.setProjectStatus(request.getProjectStatus());
        }
        if (StringUtils.hasText(request.getScopeDesc())) {
            entity.setScopeDesc(request.getScopeDesc());
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
