package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesKanbanWipQuery;
import com.huaweicloud.plm.system.dto.MesKanbanWipSaveRequest;
import com.huaweicloud.plm.system.entity.MesKanbanWip;
import com.huaweicloud.plm.system.mapper.MesKanbanWipMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 在制品看板记录服务。
 */
@Service
@RequiredArgsConstructor
public class MesKanbanWipService {

    private static final String DEFAULT_NO_PREFIX = "MKW";
    private static final String DEFAULT_RECORD_STATUS = "DRAFT";

    private final MesKanbanWipMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesKanbanWip> page(MesKanbanWipQuery query) {
        String keyword = query.getKeyword();
        Page<MesKanbanWip> page = mapper.selectPage(query.toPage(), Wrappers.<MesKanbanWip>lambdaQuery()
                .eq(StringUtils.hasText(query.getRecordStatus()), MesKanbanWip::getRecordStatus, query.getRecordStatus())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), MesKanbanWip::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesKanbanWip::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getLineCode()), MesKanbanWip::getLineCode, query.getLineCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesKanbanWip::getWipNo, keyword).or()
                        .like(MesKanbanWip::getWorkOrderNo, keyword).or()
                        .like(MesKanbanWip::getMaterialCode, keyword).or()
                        .like(MesKanbanWip::getMaterialName, keyword))
                .orderByDesc(MesKanbanWip::getId));
        return PageResult.of(page);
    }

    public MesKanbanWip detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesKanbanWipSaveRequest request) {
        MesKanbanWip entity;
        if (id == null) {
            entity = new MesKanbanWip();
            entity.setWipNo(StringUtils.hasText(request.getWipNo())
                    ? request.getWipNo()
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

    private MesKanbanWip require(Long id) {
        MesKanbanWip entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "在制品看板记录不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesKanbanWip entity, MesKanbanWipSaveRequest request) {
        if (StringUtils.hasText(request.getWipNo())) {
            entity.setWipNo(request.getWipNo());
        }
        if (StringUtils.hasText(request.getWorkOrderNo())) {
            entity.setWorkOrderNo(request.getWorkOrderNo());
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
        if (StringUtils.hasText(request.getProcessCode())) {
            entity.setProcessCode(request.getProcessCode());
        }
        if (request.getWipQty() != null) {
            entity.setWipQty(request.getWipQty());
        }
        if (StringUtils.hasText(request.getUom())) {
            entity.setUom(request.getUom());
        }
        if (request.getStatTime() != null) {
            entity.setStatTime(request.getStatTime());
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
