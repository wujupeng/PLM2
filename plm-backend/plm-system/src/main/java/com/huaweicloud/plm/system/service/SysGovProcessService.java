package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SysGovProcessQuery;
import com.huaweicloud.plm.system.dto.SysGovProcessSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovProcess;
import com.huaweicloud.plm.system.mapper.SysGovProcessMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 端到端流程（G1-N7 治理中心 T003 流程建模）：
 * 流程模型登记、分页查询与删除。流程编号支持人工指定，删除语义为「释放编号」，采用物理删除。
 */
@Service
@RequiredArgsConstructor
public class SysGovProcessService {

    private static final String DEFAULT_PROCESS_TYPE = "O2C";
    private static final String DEFAULT_PROCESS_LEVEL = "L1";
    private static final String DEFAULT_PROCESS_STATUS = "DRAFT";

    private final SysGovProcessMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询：类型/层级/状态精确，编号/编码/名称模糊，按 id 倒序。 */
    public PageResult<SysGovProcess> pageProcesses(SysGovProcessQuery query) {
        Page<SysGovProcess> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysGovProcess>lambdaQuery()
                .eq(StringUtils.hasText(query.getProcessType()),
                        SysGovProcess::getProcessType, query.getProcessType())
                .eq(StringUtils.hasText(query.getProcessLevel()),
                        SysGovProcess::getProcessLevel, query.getProcessLevel())
                .eq(StringUtils.hasText(query.getProcessStatus()),
                        SysGovProcess::getProcessStatus, query.getProcessStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysGovProcess::getProcessNo, query.getKeyword()).or()
                        .like(SysGovProcess::getProcessCode, query.getKeyword()).or()
                        .like(SysGovProcess::getProcessName, query.getKeyword()))
                .orderByDesc(SysGovProcess::getId));
        return PageResult.of(page);
    }

    public SysGovProcess detail(Long id) {
        return require(id);
    }

    /** 新增或更新：新增时回填默认类型/层级/状态与组织，流程编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysGovProcessSaveRequest request) {
        SysGovProcess entity;
        if (id == null) {
            entity = new SysGovProcess();
            entity.setProcessNo(StringUtils.hasText(request.getProcessNo())
                    ? request.getProcessNo() : flowSupport.nextBizNo("GPS"));
            entity.setProcessType(StringUtils.hasText(request.getProcessType())
                    ? request.getProcessType() : DEFAULT_PROCESS_TYPE);
            entity.setProcessLevel(StringUtils.hasText(request.getProcessLevel())
                    ? request.getProcessLevel() : DEFAULT_PROCESS_LEVEL);
            entity.setProcessStatus(StringUtils.hasText(request.getProcessStatus())
                    ? request.getProcessStatus() : DEFAULT_PROCESS_STATUS);
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

    /** 删除：物理删除以释放流程编号/编码。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysGovProcess require(Long id) {
        SysGovProcess entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "端到端流程不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空）时覆盖实体对应字段。 */
    private void applyRequest(SysGovProcess entity, SysGovProcessSaveRequest request) {
        if (StringUtils.hasText(request.getProcessNo())) {
            entity.setProcessNo(request.getProcessNo());
        }
        if (StringUtils.hasText(request.getProcessCode())) {
            entity.setProcessCode(request.getProcessCode());
        }
        if (StringUtils.hasText(request.getProcessName())) {
            entity.setProcessName(request.getProcessName());
        }
        if (StringUtils.hasText(request.getProcessType())) {
            entity.setProcessType(request.getProcessType());
        }
        if (StringUtils.hasText(request.getProcessLevel())) {
            entity.setProcessLevel(request.getProcessLevel());
        }
        if (StringUtils.hasText(request.getOwnerDept())) {
            entity.setOwnerDept(request.getOwnerDept());
        }
        if (StringUtils.hasText(request.getProcessStatus())) {
            entity.setProcessStatus(request.getProcessStatus());
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
