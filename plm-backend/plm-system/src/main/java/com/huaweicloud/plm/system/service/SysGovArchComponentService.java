package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SysGovArchComponentQuery;
import com.huaweicloud.plm.system.dto.SysGovArchComponentSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovArchComponent;
import com.huaweicloud.plm.system.mapper.SysGovArchComponentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 架构组件（G1-N7 公共平台底座—治理中心 WBS T005 总体架构）：
 * 架构组件登记、分页查询与删除。
 * 组件编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysGovArchComponentService {

    private static final String DEFAULT_ARCH_LAYER = "APPLICATION";
    private static final String DEFAULT_COMPONENT_STATUS = "ACTIVE";

    private final SysGovArchComponentMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询架构组件：分层/系统域/状态精确，编号/编码/名称模糊，按ID倒序。 */
    public PageResult<SysGovArchComponent> pageArchComponents(SysGovArchComponentQuery query) {
        Page<SysGovArchComponent> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysGovArchComponent>lambdaQuery()
                .eq(StringUtils.hasText(query.getArchLayer()),
                        SysGovArchComponent::getArchLayer, query.getArchLayer())
                .eq(StringUtils.hasText(query.getSystemDomain()),
                        SysGovArchComponent::getSystemDomain, query.getSystemDomain())
                .eq(StringUtils.hasText(query.getComponentStatus()),
                        SysGovArchComponent::getComponentStatus, query.getComponentStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysGovArchComponent::getComponentNo, query.getKeyword()).or()
                        .like(SysGovArchComponent::getComponentCode, query.getKeyword()).or()
                        .like(SysGovArchComponent::getComponentName, query.getKeyword()))
                .orderByDesc(SysGovArchComponent::getId));
        return PageResult.of(page);
    }

    public SysGovArchComponent detail(Long id) {
        return require(id);
    }

    /** 新增或更新架构组件：新增时回填默认分层/状态与组织，组件编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysGovArchComponentSaveRequest request) {
        SysGovArchComponent entity;
        if (id == null) {
            entity = new SysGovArchComponent();
            entity.setComponentNo(StringUtils.hasText(request.getComponentNo())
                    ? request.getComponentNo() : flowSupport.nextBizNo("GAC"));
            entity.setArchLayer(StringUtils.hasText(request.getArchLayer())
                    ? request.getArchLayer() : DEFAULT_ARCH_LAYER);
            entity.setComponentStatus(StringUtils.hasText(request.getComponentStatus())
                    ? request.getComponentStatus() : DEFAULT_COMPONENT_STATUS);
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

    /** 删除架构组件：物理删除以释放组件编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysGovArchComponent require(Long id) {
        SysGovArchComponent entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "架构组件不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空）时覆盖实体对应字段。 */
    private void applyRequest(SysGovArchComponent entity, SysGovArchComponentSaveRequest request) {
        if (StringUtils.hasText(request.getComponentNo())) {
            entity.setComponentNo(request.getComponentNo());
        }
        if (StringUtils.hasText(request.getComponentCode())) {
            entity.setComponentCode(request.getComponentCode());
        }
        if (StringUtils.hasText(request.getComponentName())) {
            entity.setComponentName(request.getComponentName());
        }
        if (StringUtils.hasText(request.getArchLayer())) {
            entity.setArchLayer(request.getArchLayer());
        }
        if (StringUtils.hasText(request.getSystemDomain())) {
            entity.setSystemDomain(request.getSystemDomain());
        }
        if (StringUtils.hasText(request.getComponentType())) {
            entity.setComponentType(request.getComponentType());
        }
        if (StringUtils.hasText(request.getTechStack())) {
            entity.setTechStack(request.getTechStack());
        }
        if (StringUtils.hasText(request.getDeployUnit())) {
            entity.setDeployUnit(request.getDeployUnit());
        }
        if (StringUtils.hasText(request.getComponentStatus())) {
            entity.setComponentStatus(request.getComponentStatus());
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
