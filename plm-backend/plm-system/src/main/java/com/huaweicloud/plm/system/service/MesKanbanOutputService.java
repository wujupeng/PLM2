package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesKanbanOutputQuery;
import com.huaweicloud.plm.system.dto.MesKanbanOutputSaveRequest;
import com.huaweicloud.plm.system.entity.MesKanbanOutput;
import com.huaweicloud.plm.system.mapper.MesKanbanOutputMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 产量看板记录服务。
 */
@Service
@RequiredArgsConstructor
public class MesKanbanOutputService {

    private static final String DEFAULT_NO_PREFIX = "MKO";
    private static final String DEFAULT_RECORD_STATUS = "DRAFT";

    private final MesKanbanOutputMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesKanbanOutput> page(MesKanbanOutputQuery query) {
        String keyword = query.getKeyword();
        Page<MesKanbanOutput> page = mapper.selectPage(query.toPage(), Wrappers.<MesKanbanOutput>lambdaQuery()
                .eq(StringUtils.hasText(query.getRecordStatus()), MesKanbanOutput::getRecordStatus, query.getRecordStatus())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesKanbanOutput::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getLineCode()), MesKanbanOutput::getLineCode, query.getLineCode())
                .eq(StringUtils.hasText(query.getShiftCode()), MesKanbanOutput::getShiftCode, query.getShiftCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesKanbanOutput::getOutputNo, keyword).or()
                        .like(MesKanbanOutput::getMaterialCode, keyword).or()
                        .like(MesKanbanOutput::getMaterialName, keyword).or()
                        .like(MesKanbanOutput::getLineCode, keyword))
                .orderByDesc(MesKanbanOutput::getId));
        return PageResult.of(page);
    }

    public MesKanbanOutput detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesKanbanOutputSaveRequest request) {
        MesKanbanOutput entity;
        if (id == null) {
            entity = new MesKanbanOutput();
            entity.setOutputNo(StringUtils.hasText(request.getOutputNo())
                    ? request.getOutputNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
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

    private MesKanbanOutput require(Long id) {
        MesKanbanOutput entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "产量看板记录不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesKanbanOutput entity, MesKanbanOutputSaveRequest request) {
        if (StringUtils.hasText(request.getOutputNo())) {
            entity.setOutputNo(request.getOutputNo());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getLineCode())) {
            entity.setLineCode(request.getLineCode());
        }
        if (StringUtils.hasText(request.getShiftCode())) {
            entity.setShiftCode(request.getShiftCode());
        }
        if (request.getOutputQty() != null) {
            entity.setOutputQty(request.getOutputQty());
        }
        if (request.getQualifiedQty() != null) {
            entity.setQualifiedQty(request.getQualifiedQty());
        }
        if (request.getUnqualifiedQty() != null) {
            entity.setUnqualifiedQty(request.getUnqualifiedQty());
        }
        if (StringUtils.hasText(request.getUom())) {
            entity.setUom(request.getUom());
        }
        if (request.getOutputDate() != null) {
            entity.setOutputDate(request.getOutputDate());
        }
        if (StringUtils.hasText(request.getRecordStatus())) {
            entity.setRecordStatus(request.getRecordStatus());
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
