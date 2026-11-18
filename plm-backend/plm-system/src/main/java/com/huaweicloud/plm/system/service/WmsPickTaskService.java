package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsPickTaskQuery;
import com.huaweicloud.plm.system.dto.WmsPickTaskSaveRequest;
import com.huaweicloud.plm.system.entity.WmsPickTask;
import com.huaweicloud.plm.system.mapper.WmsPickTaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 拣料单服务。
 */
@Service
@RequiredArgsConstructor
public class WmsPickTaskService {

    private static final String DEFAULT_NO_PREFIX = "PCK";
    private static final String DEFAULT_PICK_TYPE = "PRODUCTION";
    private static final String DEFAULT_PICK_STRATEGY = "FIFO";
    private static final String DEFAULT_PICK_STATUS = "PENDING";

    private final WmsPickTaskMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<WmsPickTask> page(WmsPickTaskQuery query) {
        String keyword = query.getKeyword();
        Page<WmsPickTask> page = mapper.selectPage(query.toPage(), Wrappers.<WmsPickTask>lambdaQuery()
                .eq(StringUtils.hasText(query.getPickStatus()), WmsPickTask::getPickStatus, query.getPickStatus())
                .eq(StringUtils.hasText(query.getPickType()), WmsPickTask::getPickType, query.getPickType())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), WmsPickTask::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsPickTask::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(WmsPickTask::getPickNo, keyword).or()
                        .like(WmsPickTask::getWorkOrderNo, keyword).or()
                        .like(WmsPickTask::getMaterialCode, keyword).or()
                        .like(WmsPickTask::getMaterialName, keyword))
                .orderByDesc(WmsPickTask::getId));
        return PageResult.of(page);
    }

    public WmsPickTask detail(Long id) {
        return require(id);
    }

    public Long save(Long id, WmsPickTaskSaveRequest request) {
        WmsPickTask entity;
        if (id == null) {
            entity = new WmsPickTask();
            entity.setPickNo(StringUtils.hasText(request.getPickNo())
                    ? request.getPickNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setPickType(StringUtils.hasText(request.getPickType())
                    ? request.getPickType() : DEFAULT_PICK_TYPE);
            entity.setPickStrategy(StringUtils.hasText(request.getPickStrategy())
                    ? request.getPickStrategy() : DEFAULT_PICK_STRATEGY);
            entity.setPickStatus(StringUtils.hasText(request.getPickStatus())
                    ? request.getPickStatus() : DEFAULT_PICK_STATUS);
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

    private WmsPickTask require(Long id) {
        WmsPickTask entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "拣料单不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(WmsPickTask entity, WmsPickTaskSaveRequest request) {
        if (StringUtils.hasText(request.getPickNo())) {
            entity.setPickNo(request.getPickNo());
        }
        if (StringUtils.hasText(request.getPickType())) {
            entity.setPickType(request.getPickType());
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
        if (StringUtils.hasText(request.getSpec())) {
            entity.setSpec(request.getSpec());
        }
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getFromBinCode())) {
            entity.setFromBinCode(request.getFromBinCode());
        }
        if (StringUtils.hasText(request.getToBinCode())) {
            entity.setToBinCode(request.getToBinCode());
        }
        if (request.getRequiredQty() != null) {
            entity.setRequiredQty(request.getRequiredQty());
        }
        if (request.getPickedQty() != null) {
            entity.setPickedQty(request.getPickedQty());
        }
        if (StringUtils.hasText(request.getPickStrategy())) {
            entity.setPickStrategy(request.getPickStrategy());
        }
        if (request.getTaskPriority() != null) {
            entity.setTaskPriority(request.getTaskPriority());
        }
        if (StringUtils.hasText(request.getOperator())) {
            entity.setOperator(request.getOperator());
        }
        if (request.getPickTime() != null) {
            entity.setPickTime(request.getPickTime());
        }
        if (StringUtils.hasText(request.getPickStatus())) {
            entity.setPickStatus(request.getPickStatus());
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
