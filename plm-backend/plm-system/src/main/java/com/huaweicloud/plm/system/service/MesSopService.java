package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesSopQuery;
import com.huaweicloud.plm.system.dto.MesSopSaveRequest;
import com.huaweicloud.plm.system.entity.MesSop;
import com.huaweicloud.plm.system.mapper.MesSopMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * SOP作业指导书服务。
 */
@Service
@RequiredArgsConstructor
public class MesSopService {

    private static final String DEFAULT_NO_PREFIX = "MSOP";
    private static final String DEFAULT_SOP_STATUS = "DRAFT";

    private final MesSopMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesSop> page(MesSopQuery query) {
        String keyword = query.getKeyword();
        Page<MesSop> page = mapper.selectPage(query.toPage(), Wrappers.<MesSop>lambdaQuery()
                .eq(StringUtils.hasText(query.getSopStatus()), MesSop::getSopStatus, query.getSopStatus())
                .eq(StringUtils.hasText(query.getProcessCode()), MesSop::getProcessCode, query.getProcessCode())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesSop::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getSopVersion()), MesSop::getSopVersion, query.getSopVersion())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesSop::getSopNo, keyword).or()
                        .like(MesSop::getSopName, keyword).or()
                        .like(MesSop::getProcessCode, keyword).or()
                        .like(MesSop::getMaterialCode, keyword))
                .orderByDesc(MesSop::getId));
        return PageResult.of(page);
    }

    public MesSop detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesSopSaveRequest request) {
        MesSop entity;
        if (id == null) {
            entity = new MesSop();
            entity.setSopNo(StringUtils.hasText(request.getSopNo())
                    ? request.getSopNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setSopStatus(StringUtils.hasText(request.getSopStatus())
                    ? request.getSopStatus() : DEFAULT_SOP_STATUS);
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

    private MesSop require(Long id) {
        MesSop entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "SOP作业指导书不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesSop entity, MesSopSaveRequest request) {
        if (StringUtils.hasText(request.getSopNo())) {
            entity.setSopNo(request.getSopNo());
        }
        if (StringUtils.hasText(request.getSopName())) {
            entity.setSopName(request.getSopName());
        }
        if (StringUtils.hasText(request.getProcessCode())) {
            entity.setProcessCode(request.getProcessCode());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getSpec())) {
            entity.setSpec(request.getSpec());
        }
        if (StringUtils.hasText(request.getSopVersion())) {
            entity.setSopVersion(request.getSopVersion());
        }
        if (StringUtils.hasText(request.getFileName())) {
            entity.setFileName(request.getFileName());
        }
        if (StringUtils.hasText(request.getFileUrl())) {
            entity.setFileUrl(request.getFileUrl());
        }
        if (request.getEffectiveDate() != null) {
            entity.setEffectiveDate(request.getEffectiveDate());
        }
        if (StringUtils.hasText(request.getSopStatus())) {
            entity.setSopStatus(request.getSopStatus());
        }
        if (StringUtils.hasText(request.getAuthor())) {
            entity.setAuthor(request.getAuthor());
        }
        if (request.getPublishTime() != null) {
            entity.setPublishTime(request.getPublishTime());
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
