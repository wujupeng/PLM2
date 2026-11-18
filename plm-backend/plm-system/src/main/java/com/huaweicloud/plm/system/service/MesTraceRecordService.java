package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesTraceRecordQuery;
import com.huaweicloud.plm.system.dto.MesTraceRecordSaveRequest;
import com.huaweicloud.plm.system.entity.MesTraceRecord;
import com.huaweicloud.plm.system.mapper.MesTraceRecordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 追溯记录服务。
 */
@Service
@RequiredArgsConstructor
public class MesTraceRecordService {

    private static final String DEFAULT_NO_PREFIX = "MTR";
    private static final String DEFAULT_OBJECT_TYPE = "SERIAL";
    private static final String DEFAULT_RECORD_STATUS = "DRAFT";

    private final MesTraceRecordMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesTraceRecord> page(MesTraceRecordQuery query) {
        String keyword = query.getKeyword();
        Page<MesTraceRecord> page = mapper.selectPage(query.toPage(), Wrappers.<MesTraceRecord>lambdaQuery()
                .eq(StringUtils.hasText(query.getObjectType()), MesTraceRecord::getObjectType, query.getObjectType())
                .eq(StringUtils.hasText(query.getRecordStatus()), MesTraceRecord::getRecordStatus, query.getRecordStatus())
                .eq(StringUtils.hasText(query.getObjectCode()), MesTraceRecord::getObjectCode, query.getObjectCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesTraceRecord::getRecordNo, keyword).or()
                        .like(MesTraceRecord::getObjectCode, keyword).or()
                        .like(MesTraceRecord::getRecorder, keyword).or()
                        .like(MesTraceRecord::getTracePath, keyword))
                .orderByDesc(MesTraceRecord::getId));
        return PageResult.of(page);
    }

    public MesTraceRecord detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesTraceRecordSaveRequest request) {
        MesTraceRecord entity;
        if (id == null) {
            entity = new MesTraceRecord();
            entity.setRecordNo(StringUtils.hasText(request.getRecordNo())
                    ? request.getRecordNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setObjectType(StringUtils.hasText(request.getObjectType())
                    ? request.getObjectType() : DEFAULT_OBJECT_TYPE);
            entity.setRecordStatus(StringUtils.hasText(request.getRecordStatus())
                    ? request.getRecordStatus() : DEFAULT_RECORD_STATUS);
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

    private MesTraceRecord require(Long id) {
        MesTraceRecord entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "追溯记录不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesTraceRecord entity, MesTraceRecordSaveRequest request) {
        if (StringUtils.hasText(request.getRecordNo())) {
            entity.setRecordNo(request.getRecordNo());
        }
        if (StringUtils.hasText(request.getObjectType())) {
            entity.setObjectType(request.getObjectType());
        }
        if (StringUtils.hasText(request.getObjectCode())) {
            entity.setObjectCode(request.getObjectCode());
        }
        if (StringUtils.hasText(request.getRecordStatus())) {
            entity.setRecordStatus(request.getRecordStatus());
        }
        if (StringUtils.hasText(request.getTracePath())) {
            entity.setTracePath(request.getTracePath());
        }
        if (request.getNodeCount() != null) {
            entity.setNodeCount(request.getNodeCount());
        }
        if (request.getRecordTime() != null) {
            entity.setRecordTime(request.getRecordTime());
        }
        if (StringUtils.hasText(request.getRecorder())) {
            entity.setRecorder(request.getRecorder());
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
