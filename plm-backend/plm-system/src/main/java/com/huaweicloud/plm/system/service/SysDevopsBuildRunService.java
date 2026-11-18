package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.DevopsBuildRunQuery;
import com.huaweicloud.plm.system.dto.DevopsBuildRunSaveRequest;
import com.huaweicloud.plm.system.entity.SysDevopsBuildRun;
import com.huaweicloud.plm.system.mapper.SysDevopsBuildRunMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 构建部署记录（G1-N7 公共平台底座—DevSecOps WBS T012）：
 * 构建运行记录、分页查询与删除。
 * 运行编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysDevopsBuildRunService {

    private static final String STATUS_RUNNING = "RUNNING";

    private final SysDevopsBuildRunMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询构建记录：流水线/环境/状态精确，运行编号/构建号/提交号/消息模糊，时间区间作用于开始时间，按 id 倒序。 */
    public PageResult<SysDevopsBuildRun> pageBuildRuns(DevopsBuildRunQuery query) {
        Page<SysDevopsBuildRun> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysDevopsBuildRun>lambdaQuery()
                .eq(StringUtils.hasText(query.getPipelineCode()),
                        SysDevopsBuildRun::getPipelineCode, query.getPipelineCode())
                .eq(StringUtils.hasText(query.getEnvCode()),
                        SysDevopsBuildRun::getEnvCode, query.getEnvCode())
                .eq(StringUtils.hasText(query.getBuildStatus()),
                        SysDevopsBuildRun::getBuildStatus, query.getBuildStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysDevopsBuildRun::getStartTime,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysDevopsBuildRun::getStartTime,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysDevopsBuildRun::getRunNo, query.getKeyword()).or()
                        .like(SysDevopsBuildRun::getBuildNo, query.getKeyword()).or()
                        .like(SysDevopsBuildRun::getCommitId, query.getKeyword()).or()
                        .like(SysDevopsBuildRun::getMessage, query.getKeyword()))
                .orderByDesc(SysDevopsBuildRun::getId));
        return PageResult.of(page);
    }

    public SysDevopsBuildRun detail(Long id) {
        return require(id);
    }

    /** 新增或更新构建记录：新增时回填默认状态与组织，运行编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, DevopsBuildRunSaveRequest request) {
        SysDevopsBuildRun entity;
        if (id == null) {
            entity = new SysDevopsBuildRun();
            entity.setRunNo(StringUtils.hasText(request.getRunNo())
                    ? request.getRunNo() : flowSupport.nextBizNo("DBR"));
            entity.setBuildStatus(StringUtils.hasText(request.getBuildStatus())
                    ? request.getBuildStatus() : STATUS_RUNNING);
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

    /** 删除构建记录：物理删除以释放运行编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysDevopsBuildRun require(Long id) {
        SysDevopsBuildRun entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "构建部署记录不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysDevopsBuildRun entity, DevopsBuildRunSaveRequest request) {
        if (StringUtils.hasText(request.getRunNo())) {
            entity.setRunNo(request.getRunNo());
        }
        if (StringUtils.hasText(request.getPipelineCode())) {
            entity.setPipelineCode(request.getPipelineCode());
        }
        if (StringUtils.hasText(request.getBuildNo())) {
            entity.setBuildNo(request.getBuildNo());
        }
        if (StringUtils.hasText(request.getEnvCode())) {
            entity.setEnvCode(request.getEnvCode());
        }
        if (StringUtils.hasText(request.getCommitId())) {
            entity.setCommitId(request.getCommitId());
        }
        if (StringUtils.hasText(request.getBuildStatus())) {
            entity.setBuildStatus(request.getBuildStatus());
        }
        if (request.getStartTime() != null) {
            entity.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            entity.setEndTime(request.getEndTime());
        }
        if (request.getDurationMs() != null) {
            entity.setDurationMs(request.getDurationMs());
        }
        if (StringUtils.hasText(request.getArtifactRef())) {
            entity.setArtifactRef(request.getArtifactRef());
        }
        if (StringUtils.hasText(request.getMessage())) {
            entity.setMessage(request.getMessage());
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
