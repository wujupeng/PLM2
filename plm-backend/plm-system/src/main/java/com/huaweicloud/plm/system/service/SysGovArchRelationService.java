package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SysGovArchRelationQuery;
import com.huaweicloud.plm.system.dto.SysGovArchRelationSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovArchRelation;
import com.huaweicloud.plm.system.mapper.SysGovArchRelationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 架构关系（G1-N7 公共平台底座—治理中心 WBS T005 总体架构）：
 * 架构关系登记、分页查询与删除。
 * 关系编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysGovArchRelationService {

    private static final String DEFAULT_RELATION_TYPE = "CALL";
    private static final String DEFAULT_RELATION_STATUS = "ACTIVE";

    private final SysGovArchRelationMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询架构关系：源组件/目标组件/关系类型/状态精确，编号/源组件/目标组件/说明模糊，按ID倒序。 */
    public PageResult<SysGovArchRelation> pageArchRelations(SysGovArchRelationQuery query) {
        Page<SysGovArchRelation> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysGovArchRelation>lambdaQuery()
                .eq(StringUtils.hasText(query.getSourceComponent()),
                        SysGovArchRelation::getSourceComponent, query.getSourceComponent())
                .eq(StringUtils.hasText(query.getTargetComponent()),
                        SysGovArchRelation::getTargetComponent, query.getTargetComponent())
                .eq(StringUtils.hasText(query.getRelationType()),
                        SysGovArchRelation::getRelationType, query.getRelationType())
                .eq(StringUtils.hasText(query.getRelationStatus()),
                        SysGovArchRelation::getRelationStatus, query.getRelationStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysGovArchRelation::getRelationNo, query.getKeyword()).or()
                        .like(SysGovArchRelation::getSourceComponent, query.getKeyword()).or()
                        .like(SysGovArchRelation::getTargetComponent, query.getKeyword()).or()
                        .like(SysGovArchRelation::getRelationDesc, query.getKeyword()))
                .orderByDesc(SysGovArchRelation::getId));
        return PageResult.of(page);
    }

    public SysGovArchRelation detail(Long id) {
        return require(id);
    }

    /** 新增或更新架构关系：新增时回填默认关系类型/状态与组织，关系编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysGovArchRelationSaveRequest request) {
        SysGovArchRelation entity;
        if (id == null) {
            entity = new SysGovArchRelation();
            entity.setRelationNo(StringUtils.hasText(request.getRelationNo())
                    ? request.getRelationNo() : flowSupport.nextBizNo("GAR"));
            entity.setRelationType(StringUtils.hasText(request.getRelationType())
                    ? request.getRelationType() : DEFAULT_RELATION_TYPE);
            entity.setRelationStatus(StringUtils.hasText(request.getRelationStatus())
                    ? request.getRelationStatus() : DEFAULT_RELATION_STATUS);
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

    /** 删除架构关系：物理删除以释放关系编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysGovArchRelation require(Long id) {
        SysGovArchRelation entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "架构关系不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空）时覆盖实体对应字段。 */
    private void applyRequest(SysGovArchRelation entity, SysGovArchRelationSaveRequest request) {
        if (StringUtils.hasText(request.getRelationNo())) {
            entity.setRelationNo(request.getRelationNo());
        }
        if (StringUtils.hasText(request.getSourceComponent())) {
            entity.setSourceComponent(request.getSourceComponent());
        }
        if (StringUtils.hasText(request.getTargetComponent())) {
            entity.setTargetComponent(request.getTargetComponent());
        }
        if (StringUtils.hasText(request.getRelationType())) {
            entity.setRelationType(request.getRelationType());
        }
        if (StringUtils.hasText(request.getProtocol())) {
            entity.setProtocol(request.getProtocol());
        }
        if (StringUtils.hasText(request.getRelationDesc())) {
            entity.setRelationDesc(request.getRelationDesc());
        }
        if (StringUtils.hasText(request.getRelationStatus())) {
            entity.setRelationStatus(request.getRelationStatus());
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
