package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SysGovTraceLinkQuery;
import com.huaweicloud.plm.system.dto.SysGovTraceLinkSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovTraceLink;
import com.huaweicloud.plm.system.mapper.SysGovTraceLinkMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 追踪链接（G1-N7 公共平台底座—治理中心 WBS T004 需求追踪）：
 * 追踪链接登记、分页查询与删除。
 * 链接编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysGovTraceLinkService {

    private static final String DEFAULT_LINK_TYPE = "FUNCTION";
    private static final String DEFAULT_LINK_STATUS = "ACTIVE";

    private final SysGovTraceLinkMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询追踪链接：需求编码/链接类型/状态精确，编号/目标引用/目标名称模糊，按ID倒序。 */
    public PageResult<SysGovTraceLink> pageTraceLinks(SysGovTraceLinkQuery query) {
        Page<SysGovTraceLink> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysGovTraceLink>lambdaQuery()
                .eq(StringUtils.hasText(query.getReqCode()),
                        SysGovTraceLink::getReqCode, query.getReqCode())
                .eq(StringUtils.hasText(query.getLinkType()),
                        SysGovTraceLink::getLinkType, query.getLinkType())
                .eq(StringUtils.hasText(query.getLinkStatus()),
                        SysGovTraceLink::getLinkStatus, query.getLinkStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysGovTraceLink::getLinkNo, query.getKeyword()).or()
                        .like(SysGovTraceLink::getTargetRef, query.getKeyword()).or()
                        .like(SysGovTraceLink::getTargetName, query.getKeyword()))
                .orderByDesc(SysGovTraceLink::getId));
        return PageResult.of(page);
    }

    public SysGovTraceLink detail(Long id) {
        return require(id);
    }

    /** 新增或更新追踪链接：新增时回填默认类型/状态与组织，链接编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysGovTraceLinkSaveRequest request) {
        SysGovTraceLink entity;
        if (id == null) {
            entity = new SysGovTraceLink();
            entity.setLinkNo(StringUtils.hasText(request.getLinkNo())
                    ? request.getLinkNo() : flowSupport.nextBizNo("GTL"));
            entity.setLinkType(StringUtils.hasText(request.getLinkType())
                    ? request.getLinkType() : DEFAULT_LINK_TYPE);
            entity.setLinkStatus(StringUtils.hasText(request.getLinkStatus())
                    ? request.getLinkStatus() : DEFAULT_LINK_STATUS);
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

    /** 删除追踪链接：物理删除以释放链接编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysGovTraceLink require(Long id) {
        SysGovTraceLink entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "追踪链接不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空）时覆盖实体对应字段。 */
    private void applyRequest(SysGovTraceLink entity, SysGovTraceLinkSaveRequest request) {
        if (StringUtils.hasText(request.getLinkNo())) {
            entity.setLinkNo(request.getLinkNo());
        }
        if (StringUtils.hasText(request.getReqCode())) {
            entity.setReqCode(request.getReqCode());
        }
        if (StringUtils.hasText(request.getLinkType())) {
            entity.setLinkType(request.getLinkType());
        }
        if (StringUtils.hasText(request.getTargetRef())) {
            entity.setTargetRef(request.getTargetRef());
        }
        if (StringUtils.hasText(request.getTargetName())) {
            entity.setTargetName(request.getTargetName());
        }
        if (StringUtils.hasText(request.getLinkDesc())) {
            entity.setLinkDesc(request.getLinkDesc());
        }
        if (StringUtils.hasText(request.getLinkStatus())) {
            entity.setLinkStatus(request.getLinkStatus());
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
