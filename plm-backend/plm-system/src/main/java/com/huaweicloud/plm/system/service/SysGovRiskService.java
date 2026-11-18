package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SysGovRiskQuery;
import com.huaweicloud.plm.system.dto.SysGovRiskSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovRisk;
import com.huaweicloud.plm.system.mapper.SysGovRiskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 治理中心—项目治理—风险/问题/变更（G1-N7 公共平台底座 WBS T001 项目治理）：
 * 风险登记、分页查询与删除。
 * 风险编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysGovRiskService {

    private static final String DEFAULT_RISK_TYPE = "RISK";
    private static final String DEFAULT_RISK_LEVEL = "MEDIUM";
    private static final String DEFAULT_RISK_STATUS = "OPEN";

    private final SysGovRiskMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询风险：项目/类型/状态/等级精确，编号/标题模糊，按主键倒序。 */
    public PageResult<SysGovRisk> pageRisks(SysGovRiskQuery query) {
        Page<SysGovRisk> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysGovRisk>lambdaQuery()
                .eq(StringUtils.hasText(query.getProjectCode()),
                        SysGovRisk::getProjectCode, query.getProjectCode())
                .eq(StringUtils.hasText(query.getRiskType()),
                        SysGovRisk::getRiskType, query.getRiskType())
                .eq(StringUtils.hasText(query.getRiskStatus()),
                        SysGovRisk::getRiskStatus, query.getRiskStatus())
                .eq(StringUtils.hasText(query.getRiskLevel()),
                        SysGovRisk::getRiskLevel, query.getRiskLevel())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysGovRisk::getRiskNo, query.getKeyword()).or()
                        .like(SysGovRisk::getRiskTitle, query.getKeyword()))
                .orderByDesc(SysGovRisk::getId));
        return PageResult.of(page);
    }

    public SysGovRisk detail(Long id) {
        return require(id);
    }

    /** 新增或更新风险：新增时回填默认类型/等级/状态与组织，风险编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysGovRiskSaveRequest request) {
        SysGovRisk entity;
        if (id == null) {
            entity = new SysGovRisk();
            entity.setRiskNo(StringUtils.hasText(request.getRiskNo())
                    ? request.getRiskNo() : flowSupport.nextBizNo("GRSK"));
            entity.setRiskType(StringUtils.hasText(request.getRiskType())
                    ? request.getRiskType() : DEFAULT_RISK_TYPE);
            entity.setRiskLevel(StringUtils.hasText(request.getRiskLevel())
                    ? request.getRiskLevel() : DEFAULT_RISK_LEVEL);
            entity.setRiskStatus(StringUtils.hasText(request.getRiskStatus())
                    ? request.getRiskStatus() : DEFAULT_RISK_STATUS);
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

    /** 删除风险：物理删除以释放风险编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysGovRisk require(Long id) {
        SysGovRisk entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "治理风险不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysGovRisk entity, SysGovRiskSaveRequest request) {
        if (StringUtils.hasText(request.getRiskNo())) {
            entity.setRiskNo(request.getRiskNo());
        }
        if (StringUtils.hasText(request.getProjectCode())) {
            entity.setProjectCode(request.getProjectCode());
        }
        if (StringUtils.hasText(request.getRiskTitle())) {
            entity.setRiskTitle(request.getRiskTitle());
        }
        if (StringUtils.hasText(request.getRiskType())) {
            entity.setRiskType(request.getRiskType());
        }
        if (StringUtils.hasText(request.getRiskLevel())) {
            entity.setRiskLevel(request.getRiskLevel());
        }
        if (StringUtils.hasText(request.getProbability())) {
            entity.setProbability(request.getProbability());
        }
        if (StringUtils.hasText(request.getImpact())) {
            entity.setImpact(request.getImpact());
        }
        if (StringUtils.hasText(request.getMitigation())) {
            entity.setMitigation(request.getMitigation());
        }
        if (StringUtils.hasText(request.getRiskStatus())) {
            entity.setRiskStatus(request.getRiskStatus());
        }
        if (StringUtils.hasText(request.getOwnerName())) {
            entity.setOwnerName(request.getOwnerName());
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
