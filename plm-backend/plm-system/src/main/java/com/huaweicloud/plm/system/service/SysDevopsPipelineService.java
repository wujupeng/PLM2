package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.DevopsPipelineQuery;
import com.huaweicloud.plm.system.dto.DevopsPipelineSaveRequest;
import com.huaweicloud.plm.system.entity.SysDevopsPipeline;
import com.huaweicloud.plm.system.mapper.SysDevopsPipelineMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 流水线（G1-N7 公共平台底座—DevSecOps WBS T012）：
 * 流水线登记、分页查询与删除。
 * 流水线编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysDevopsPipelineService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String DEFAULT_TRIGGER_TYPE = "PUSH";

    private final SysDevopsPipelineMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询流水线：仓库编码/触发方式/状态精确，编号/编码/名称模糊，按 id 倒序。 */
    public PageResult<SysDevopsPipeline> pagePipelines(DevopsPipelineQuery query) {
        Page<SysDevopsPipeline> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysDevopsPipeline>lambdaQuery()
                .eq(StringUtils.hasText(query.getRepoCode()),
                        SysDevopsPipeline::getRepoCode, query.getRepoCode())
                .eq(StringUtils.hasText(query.getTriggerType()),
                        SysDevopsPipeline::getTriggerType, query.getTriggerType())
                .eq(StringUtils.hasText(query.getPipelineStatus()),
                        SysDevopsPipeline::getPipelineStatus, query.getPipelineStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysDevopsPipeline::getPipelineNo, query.getKeyword()).or()
                        .like(SysDevopsPipeline::getPipelineCode, query.getKeyword()).or()
                        .like(SysDevopsPipeline::getPipelineName, query.getKeyword()))
                .orderByDesc(SysDevopsPipeline::getId));
        return PageResult.of(page);
    }

    public SysDevopsPipeline detail(Long id) {
        return require(id);
    }

    /** 新增或更新流水线：新增时回填默认触发方式/状态与组织，流水线编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, DevopsPipelineSaveRequest request) {
        SysDevopsPipeline entity;
        if (id == null) {
            entity = new SysDevopsPipeline();
            entity.setPipelineNo(StringUtils.hasText(request.getPipelineNo())
                    ? request.getPipelineNo() : flowSupport.nextBizNo("DPL"));
            entity.setTriggerType(StringUtils.hasText(request.getTriggerType())
                    ? request.getTriggerType() : DEFAULT_TRIGGER_TYPE);
            entity.setPipelineStatus(StringUtils.hasText(request.getPipelineStatus())
                    ? request.getPipelineStatus() : STATUS_ACTIVE);
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

    /** 删除流水线：物理删除以释放流水线编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysDevopsPipeline require(Long id) {
        SysDevopsPipeline entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "流水线不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空）时覆盖实体对应字段。 */
    private void applyRequest(SysDevopsPipeline entity, DevopsPipelineSaveRequest request) {
        if (StringUtils.hasText(request.getPipelineNo())) {
            entity.setPipelineNo(request.getPipelineNo());
        }
        if (StringUtils.hasText(request.getPipelineCode())) {
            entity.setPipelineCode(request.getPipelineCode());
        }
        if (StringUtils.hasText(request.getPipelineName())) {
            entity.setPipelineName(request.getPipelineName());
        }
        if (StringUtils.hasText(request.getRepoCode())) {
            entity.setRepoCode(request.getRepoCode());
        }
        if (StringUtils.hasText(request.getTriggerType())) {
            entity.setTriggerType(request.getTriggerType());
        }
        if (StringUtils.hasText(request.getPipelineStatus())) {
            entity.setPipelineStatus(request.getPipelineStatus());
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
