package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpDocTrackQuery;
import com.huaweicloud.plm.system.dto.ErpDocTrackSaveRequest;
import com.huaweicloud.plm.system.entity.ErpDocTrack;
import com.huaweicloud.plm.system.mapper.ErpDocTrackMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * ERP 业务单据追踪—单据追溯（对应 WBS G3-N7a ERP 业务单据追踪）：
 * 追溯登记、分页查询与删除。
 * 追溯号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpDocTrackService {

    private static final String DEFAULT_TRACE_NO_PREFIX = "TRK";
    private static final Integer DEFAULT_TRACK_LEVEL = 1;
    private static final String DEFAULT_BIZ_STATUS = "OPEN";
    private static final String DEFAULT_APPROVAL_STATUS = "NONE";

    private final ErpDocTrackMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询单据追溯：单据类型/业务状态/审批状态精确，追溯号/单据编号/单据标题/来源单据编号模糊，按主键倒序。 */
    public PageResult<ErpDocTrack> page(ErpDocTrackQuery query) {
        Page<ErpDocTrack> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpDocTrack>lambdaQuery()
                .eq(StringUtils.hasText(query.getDocType()),
                        ErpDocTrack::getDocType, query.getDocType())
                .eq(StringUtils.hasText(query.getBizStatus()),
                        ErpDocTrack::getBizStatus, query.getBizStatus())
                .eq(StringUtils.hasText(query.getApprovalStatus()),
                        ErpDocTrack::getApprovalStatus, query.getApprovalStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpDocTrack::getTraceNo, query.getKeyword()).or()
                        .like(ErpDocTrack::getDocNo, query.getKeyword()).or()
                        .like(ErpDocTrack::getDocTitle, query.getKeyword()).or()
                        .like(ErpDocTrack::getSourceDocNo, query.getKeyword()))
                .orderByDesc(ErpDocTrack::getId));
        return PageResult.of(page);
    }

    public ErpDocTrack detail(Long id) {
        return require(id);
    }

    /** 新增或更新单据追溯：新增时回填默认追溯层级/业务状态/审批状态与组织，追溯号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpDocTrackSaveRequest request) {
        ErpDocTrack entity;
        if (id == null) {
            entity = new ErpDocTrack();
            entity.setTraceNo(StringUtils.hasText(request.getTraceNo())
                    ? request.getTraceNo() : flowSupport.nextBizNo(DEFAULT_TRACE_NO_PREFIX));
            entity.setTrackLevel(request.getTrackLevel() != null
                    ? request.getTrackLevel() : DEFAULT_TRACK_LEVEL);
            entity.setBizStatus(StringUtils.hasText(request.getBizStatus())
                    ? request.getBizStatus() : DEFAULT_BIZ_STATUS);
            entity.setApprovalStatus(StringUtils.hasText(request.getApprovalStatus())
                    ? request.getApprovalStatus() : DEFAULT_APPROVAL_STATUS);
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

    /** 删除单据追溯：物理删除以释放追溯号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpDocTrack require(Long id) {
        ErpDocTrack entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "单据追溯不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpDocTrack entity, ErpDocTrackSaveRequest request) {
        if (StringUtils.hasText(request.getTraceNo())) {
            entity.setTraceNo(request.getTraceNo());
        }
        if (StringUtils.hasText(request.getDocType())) {
            entity.setDocType(request.getDocType());
        }
        if (StringUtils.hasText(request.getDocNo())) {
            entity.setDocNo(request.getDocNo());
        }
        if (StringUtils.hasText(request.getDocTitle())) {
            entity.setDocTitle(request.getDocTitle());
        }
        if (StringUtils.hasText(request.getSourceDocType())) {
            entity.setSourceDocType(request.getSourceDocType());
        }
        if (StringUtils.hasText(request.getSourceDocNo())) {
            entity.setSourceDocNo(request.getSourceDocNo());
        }
        if (StringUtils.hasText(request.getTargetDocType())) {
            entity.setTargetDocType(request.getTargetDocType());
        }
        if (StringUtils.hasText(request.getTargetDocNo())) {
            entity.setTargetDocNo(request.getTargetDocNo());
        }
        if (request.getTrackLevel() != null) {
            entity.setTrackLevel(request.getTrackLevel());
        }
        if (StringUtils.hasText(request.getBizStatus())) {
            entity.setBizStatus(request.getBizStatus());
        }
        if (StringUtils.hasText(request.getApprovalStatus())) {
            entity.setApprovalStatus(request.getApprovalStatus());
        }
        if (StringUtils.hasText(request.getApprovalInstanceNo())) {
            entity.setApprovalInstanceNo(request.getApprovalInstanceNo());
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
