package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpProjectQuery;
import com.huaweicloud.plm.system.dto.ErpProjectSaveRequest;
import com.huaweicloud.plm.system.entity.ErpProject;
import com.huaweicloud.plm.system.mapper.ErpProjectMapper;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * ERP 基础资料—项目档案（G3-N1 ERP 基础资料 WBS T021）：
 * 项目档案登记、分页查询与删除。
 * 项目编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpProjectService {

    private static final String DEFAULT_PROJECT_TYPE = "INTERNAL";
    private static final String DEFAULT_PROJECT_STATUS = "PLANNING";
    private static final BigDecimal DEFAULT_BUDGET_AMOUNT = BigDecimal.ZERO;

    private final ErpProjectMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询项目档案：类型/状态精确，编号/编码/名称模糊，按主键倒序。 */
    public PageResult<ErpProject> pageProjects(ErpProjectQuery query) {
        Page<ErpProject> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpProject>lambdaQuery()
                .eq(StringUtils.hasText(query.getProjectType()),
                        ErpProject::getProjectType, query.getProjectType())
                .eq(StringUtils.hasText(query.getProjectStatus()),
                        ErpProject::getProjectStatus, query.getProjectStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpProject::getProjectNo, query.getKeyword()).or()
                        .like(ErpProject::getProjectCode, query.getKeyword()).or()
                        .like(ErpProject::getProjectName, query.getKeyword()))
                .orderByDesc(ErpProject::getId));
        return PageResult.of(page);
    }

    public ErpProject detail(Long id) {
        return require(id);
    }

    /** 新增或更新项目档案：新增时回填默认类型/状态/预算金额与组织，项目编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpProjectSaveRequest request) {
        ErpProject entity;
        if (id == null) {
            entity = new ErpProject();
            entity.setProjectNo(StringUtils.hasText(request.getProjectNo())
                    ? request.getProjectNo() : flowSupport.nextBizNo("EPRJ"));
            entity.setProjectType(StringUtils.hasText(request.getProjectType())
                    ? request.getProjectType() : DEFAULT_PROJECT_TYPE);
            entity.setProjectStatus(StringUtils.hasText(request.getProjectStatus())
                    ? request.getProjectStatus() : DEFAULT_PROJECT_STATUS);
            entity.setBudgetAmount(request.getBudgetAmount() != null
                    ? request.getBudgetAmount() : DEFAULT_BUDGET_AMOUNT);
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

    /** 删除项目档案：物理删除以释放项目编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpProject require(Long id) {
        ErpProject entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "项目档案不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空 / 数值、日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpProject entity, ErpProjectSaveRequest request) {
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
        if (StringUtils.hasText(request.getProjectManager())) {
            entity.setProjectManager(request.getProjectManager());
        }
        if (StringUtils.hasText(request.getCustomerCode())) {
            entity.setCustomerCode(request.getCustomerCode());
        }
        if (request.getStartDate() != null) {
            entity.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            entity.setEndDate(request.getEndDate());
        }
        if (request.getBudgetAmount() != null) {
            entity.setBudgetAmount(request.getBudgetAmount());
        }
        if (StringUtils.hasText(request.getProjectStatus())) {
            entity.setProjectStatus(request.getProjectStatus());
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
