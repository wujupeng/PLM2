package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.DevopsGateQuery;
import com.huaweicloud.plm.system.dto.DevopsGateSaveRequest;
import com.huaweicloud.plm.system.entity.SysDevopsGate;
import com.huaweicloud.plm.system.mapper.SysDevopsGateMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 质量与安全门禁（G1-N7 公共平台底座—DevSecOps WBS T012）：
 * 门禁记录、分页查询与删除。
 * 门禁编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysDevopsGateService {

    private static final String DEFAULT_GATE_TYPE = "UNIT_TEST";
    private static final String DEFAULT_GATE_RESULT = "PASS";
    private static final int DEFAULT_ISSUE_COUNT = 0;

    private final SysDevopsGateMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询门禁：流水线/运行编号/类型/结果精确，门禁编号/名称模糊，按 id 倒序。 */
    public PageResult<SysDevopsGate> pageGates(DevopsGateQuery query) {
        Page<SysDevopsGate> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysDevopsGate>lambdaQuery()
                .eq(StringUtils.hasText(query.getPipelineCode()),
                        SysDevopsGate::getPipelineCode, query.getPipelineCode())
                .eq(StringUtils.hasText(query.getRunNo()),
                        SysDevopsGate::getRunNo, query.getRunNo())
                .eq(StringUtils.hasText(query.getGateType()),
                        SysDevopsGate::getGateType, query.getGateType())
                .eq(StringUtils.hasText(query.getGateResult()),
                        SysDevopsGate::getGateResult, query.getGateResult())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysDevopsGate::getGateNo, query.getKeyword()).or()
                        .like(SysDevopsGate::getGateName, query.getKeyword()))
                .orderByDesc(SysDevopsGate::getId));
        return PageResult.of(page);
    }

    public SysDevopsGate detail(Long id) {
        return require(id);
    }

    /** 新增或更新门禁：新增时回填默认类型/问题数/结果与组织，门禁编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, DevopsGateSaveRequest request) {
        SysDevopsGate entity;
        if (id == null) {
            entity = new SysDevopsGate();
            entity.setGateNo(StringUtils.hasText(request.getGateNo())
                    ? request.getGateNo() : flowSupport.nextBizNo("DGT"));
            entity.setGateType(StringUtils.hasText(request.getGateType())
                    ? request.getGateType() : DEFAULT_GATE_TYPE);
            entity.setIssueCount(request.getIssueCount() == null
                    ? DEFAULT_ISSUE_COUNT : request.getIssueCount());
            entity.setGateResult(StringUtils.hasText(request.getGateResult())
                    ? request.getGateResult() : DEFAULT_GATE_RESULT);
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

    /** 删除门禁：物理删除以释放门禁编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysDevopsGate require(Long id) {
        SysDevopsGate entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "质量与安全门禁不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysDevopsGate entity, DevopsGateSaveRequest request) {
        if (StringUtils.hasText(request.getGateNo())) {
            entity.setGateNo(request.getGateNo());
        }
        if (StringUtils.hasText(request.getPipelineCode())) {
            entity.setPipelineCode(request.getPipelineCode());
        }
        if (StringUtils.hasText(request.getRunNo())) {
            entity.setRunNo(request.getRunNo());
        }
        if (StringUtils.hasText(request.getGateName())) {
            entity.setGateName(request.getGateName());
        }
        if (StringUtils.hasText(request.getGateType())) {
            entity.setGateType(request.getGateType());
        }
        if (StringUtils.hasText(request.getThresholdExpr())) {
            entity.setThresholdExpr(request.getThresholdExpr());
        }
        if (request.getIssueCount() != null) {
            entity.setIssueCount(request.getIssueCount());
        }
        if (StringUtils.hasText(request.getSeverity())) {
            entity.setSeverity(request.getSeverity());
        }
        if (StringUtils.hasText(request.getGateResult())) {
            entity.setGateResult(request.getGateResult());
        }
        if (request.getCheckTime() != null) {
            entity.setCheckTime(request.getCheckTime());
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
