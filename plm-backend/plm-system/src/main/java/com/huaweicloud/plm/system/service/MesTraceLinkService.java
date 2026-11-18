package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesTraceLinkQuery;
import com.huaweicloud.plm.system.dto.MesTraceLinkSaveRequest;
import com.huaweicloud.plm.system.entity.MesTraceLink;
import com.huaweicloud.plm.system.mapper.MesTraceLinkMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 追溯关联服务。
 */
@Service
@RequiredArgsConstructor
public class MesTraceLinkService {

    private static final String DEFAULT_NO_PREFIX = "MLK";
    private static final String DEFAULT_OBJECT_TYPE = "SERIAL";
    private static final String DEFAULT_LINK_TYPE = "PERSON";

    private final MesTraceLinkMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesTraceLink> page(MesTraceLinkQuery query) {
        String keyword = query.getKeyword();
        Page<MesTraceLink> page = mapper.selectPage(query.toPage(), Wrappers.<MesTraceLink>lambdaQuery()
                .eq(StringUtils.hasText(query.getObjectType()), MesTraceLink::getObjectType, query.getObjectType())
                .eq(StringUtils.hasText(query.getLinkType()), MesTraceLink::getLinkType, query.getLinkType())
                .eq(StringUtils.hasText(query.getObjectCode()), MesTraceLink::getObjectCode, query.getObjectCode())
                .eq(StringUtils.hasText(query.getLinkCode()), MesTraceLink::getLinkCode, query.getLinkCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesTraceLink::getLinkNo, keyword).or()
                        .like(MesTraceLink::getObjectCode, keyword).or()
                        .like(MesTraceLink::getLinkCode, keyword).or()
                        .like(MesTraceLink::getLinkName, keyword))
                .orderByDesc(MesTraceLink::getId));
        return PageResult.of(page);
    }

    public MesTraceLink detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesTraceLinkSaveRequest request) {
        MesTraceLink entity;
        if (id == null) {
            entity = new MesTraceLink();
            entity.setLinkNo(StringUtils.hasText(request.getLinkNo())
                    ? request.getLinkNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setObjectType(StringUtils.hasText(request.getObjectType())
                    ? request.getObjectType() : DEFAULT_OBJECT_TYPE);
            entity.setLinkType(StringUtils.hasText(request.getLinkType())
                    ? request.getLinkType() : DEFAULT_LINK_TYPE);
            entity.setOrgId(currentOrgId());
            applyRequest(entity, request);
            mapper.insert(entity);
        } else {
            entity = require(id);
            applyRequest(entity, request);
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    private MesTraceLink require(Long id) {
        MesTraceLink entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "追溯关联不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesTraceLink entity, MesTraceLinkSaveRequest request) {
        if (StringUtils.hasText(request.getLinkNo())) {
            entity.setLinkNo(request.getLinkNo());
        }
        if (StringUtils.hasText(request.getObjectType())) {
            entity.setObjectType(request.getObjectType());
        }
        if (StringUtils.hasText(request.getObjectCode())) {
            entity.setObjectCode(request.getObjectCode());
        }
        if (StringUtils.hasText(request.getLinkType())) {
            entity.setLinkType(request.getLinkType());
        }
        if (StringUtils.hasText(request.getLinkCode())) {
            entity.setLinkCode(request.getLinkCode());
        }
        if (StringUtils.hasText(request.getLinkName())) {
            entity.setLinkName(request.getLinkName());
        }
        if (StringUtils.hasText(request.getLinkValue())) {
            entity.setLinkValue(request.getLinkValue());
        }
        if (request.getLinkTime() != null) {
            entity.setLinkTime(request.getLinkTime());
        }
        if (StringUtils.hasText(request.getOperator())) {
            entity.setOperator(request.getOperator());
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
