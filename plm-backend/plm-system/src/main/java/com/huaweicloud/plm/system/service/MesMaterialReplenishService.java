package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesMaterialReplenishQuery;
import com.huaweicloud.plm.system.dto.MesMaterialReplenishSaveRequest;
import com.huaweicloud.plm.system.entity.MesMaterialReplenish;
import com.huaweicloud.plm.system.mapper.MesMaterialReplenishMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 补料记录服务。
 */
@Service
@RequiredArgsConstructor
public class MesMaterialReplenishService {

    private static final String DEFAULT_NO_PREFIX = "MMR";
    private static final String DEFAULT_REPLENISH_TYPE = "SUPPLEMENT";
    private static final String DEFAULT_REPLENISH_STATUS = "DRAFT";

    private final MesMaterialReplenishMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesMaterialReplenish> page(MesMaterialReplenishQuery query) {
        String keyword = query.getKeyword();
        Page<MesMaterialReplenish> page = mapper.selectPage(query.toPage(), Wrappers.<MesMaterialReplenish>lambdaQuery()
                .eq(StringUtils.hasText(query.getReplenishStatus()), MesMaterialReplenish::getReplenishStatus, query.getReplenishStatus())
                .eq(StringUtils.hasText(query.getReplenishType()), MesMaterialReplenish::getReplenishType, query.getReplenishType())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), MesMaterialReplenish::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesMaterialReplenish::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesMaterialReplenish::getReplenishNo, keyword).or()
                        .like(MesMaterialReplenish::getWorkOrderNo, keyword).or()
                        .like(MesMaterialReplenish::getMaterialCode, keyword).or()
                        .like(MesMaterialReplenish::getMaterialName, keyword).or()
                        .like(MesMaterialReplenish::getBatchNo, keyword))
                .orderByDesc(MesMaterialReplenish::getId));
        return PageResult.of(page);
    }

    public MesMaterialReplenish detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesMaterialReplenishSaveRequest request) {
        MesMaterialReplenish entity;
        if (id == null) {
            entity = new MesMaterialReplenish();
            entity.setReplenishNo(StringUtils.hasText(request.getReplenishNo())
                    ? request.getReplenishNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setReplenishType(StringUtils.hasText(request.getReplenishType())
                    ? request.getReplenishType() : DEFAULT_REPLENISH_TYPE);
            entity.setReplenishStatus(StringUtils.hasText(request.getReplenishStatus())
                    ? request.getReplenishStatus() : DEFAULT_REPLENISH_STATUS);
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

    private MesMaterialReplenish require(Long id) {
        MesMaterialReplenish entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "补料记录不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesMaterialReplenish entity, MesMaterialReplenishSaveRequest request) {
        if (StringUtils.hasText(request.getReplenishNo())) {
            entity.setReplenishNo(request.getReplenishNo());
        }
        if (StringUtils.hasText(request.getWorkOrderNo())) {
            entity.setWorkOrderNo(request.getWorkOrderNo());
        }
        if (StringUtils.hasText(request.getDispatchNo())) {
            entity.setDispatchNo(request.getDispatchNo());
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
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (request.getReplenishQty() != null) {
            entity.setReplenishQty(request.getReplenishQty());
        }
        if (StringUtils.hasText(request.getUnit())) {
            entity.setUnit(request.getUnit());
        }
        if (StringUtils.hasText(request.getReplenishType())) {
            entity.setReplenishType(request.getReplenishType());
        }
        if (StringUtils.hasText(request.getReason())) {
            entity.setReason(request.getReason());
        }
        if (StringUtils.hasText(request.getApplicant())) {
            entity.setApplicant(request.getApplicant());
        }
        if (request.getApplyTime() != null) {
            entity.setApplyTime(request.getApplyTime());
        }
        if (StringUtils.hasText(request.getReplenishStatus())) {
            entity.setReplenishStatus(request.getReplenishStatus());
        }
        if (StringUtils.hasText(request.getIssuer())) {
            entity.setIssuer(request.getIssuer());
        }
        if (request.getIssueTime() != null) {
            entity.setIssueTime(request.getIssueTime());
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
