package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesBatchTraceQuery;
import com.huaweicloud.plm.system.dto.MesBatchTraceSaveRequest;
import com.huaweicloud.plm.system.entity.MesBatchTrace;
import com.huaweicloud.plm.system.mapper.MesBatchTraceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 批次追溯服务。
 */
@Service
@RequiredArgsConstructor
public class MesBatchTraceService {

    private static final String DEFAULT_NO_PREFIX = "MBT";
    private static final String DEFAULT_BATCH_STATUS = "PENDING";

    private final MesBatchTraceMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesBatchTrace> page(MesBatchTraceQuery query) {
        String keyword = query.getKeyword();
        Page<MesBatchTrace> page = mapper.selectPage(query.toPage(), Wrappers.<MesBatchTrace>lambdaQuery()
                .eq(StringUtils.hasText(query.getBatchStatus()), MesBatchTrace::getBatchStatus, query.getBatchStatus())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesBatchTrace::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), MesBatchTrace::getWorkOrderNo, query.getWorkOrderNo())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesBatchTrace::getBatchNo, keyword).or()
                        .like(MesBatchTrace::getMaterialCode, keyword).or()
                        .like(MesBatchTrace::getMaterialName, keyword).or()
                        .like(MesBatchTrace::getWorkOrderNo, keyword))
                .orderByDesc(MesBatchTrace::getId));
        return PageResult.of(page);
    }

    public MesBatchTrace detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesBatchTraceSaveRequest request) {
        MesBatchTrace entity;
        if (id == null) {
            entity = new MesBatchTrace();
            entity.setBatchNo(StringUtils.hasText(request.getBatchNo())
                    ? request.getBatchNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setBatchStatus(StringUtils.hasText(request.getBatchStatus())
                    ? request.getBatchStatus() : DEFAULT_BATCH_STATUS);
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

    private MesBatchTrace require(Long id) {
        MesBatchTrace entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "批次追溯不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesBatchTrace entity, MesBatchTraceSaveRequest request) {
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getBatchStatus())) {
            entity.setBatchStatus(request.getBatchStatus());
        }
        if (StringUtils.hasText(request.getWorkOrderNo())) {
            entity.setWorkOrderNo(request.getWorkOrderNo());
        }
        if (request.getQuantity() != null) {
            entity.setQuantity(request.getQuantity());
        }
        if (StringUtils.hasText(request.getUnit())) {
            entity.setUnit(request.getUnit());
        }
        if (request.getProduceTime() != null) {
            entity.setProduceTime(request.getProduceTime());
        }
        if (request.getExpireTime() != null) {
            entity.setExpireTime(request.getExpireTime());
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
