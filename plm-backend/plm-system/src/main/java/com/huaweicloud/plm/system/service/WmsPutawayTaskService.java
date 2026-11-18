package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsPutawayTaskQuery;
import com.huaweicloud.plm.system.dto.WmsPutawayTaskSaveRequest;
import com.huaweicloud.plm.system.entity.WmsPutawayTask;
import com.huaweicloud.plm.system.mapper.WmsPutawayTaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * WMS 收货上架—上架任务（对应上架任务）：
 * 上架任务登记、分页查询与删除。
 * 上架任务号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class WmsPutawayTaskService {

    private static final String DEFAULT_TASK_NO_PREFIX = "PUT";
    private static final String DEFAULT_PUTAWAY_STATUS = "PENDING";
    private static final Integer DEFAULT_TASK_PRIORITY = 0;

    private final WmsPutawayTaskMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询上架任务记录：上架状态/收货单号/物料编码/目标库位精确，上架任务号/收货单号/物料编码/物料名称/批次号模糊，按主键倒序。 */
    public PageResult<WmsPutawayTask> page(WmsPutawayTaskQuery query) {
        Page<WmsPutawayTask> page = query.toPage();
        mapper.selectPage(page, Wrappers.<WmsPutawayTask>lambdaQuery()
                .eq(StringUtils.hasText(query.getPutawayStatus()),
                        WmsPutawayTask::getPutawayStatus, query.getPutawayStatus())
                .eq(StringUtils.hasText(query.getReceiptNo()),
                        WmsPutawayTask::getReceiptNo, query.getReceiptNo())
                .eq(StringUtils.hasText(query.getMaterialCode()),
                        WmsPutawayTask::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getToBinCode()),
                        WmsPutawayTask::getToBinCode, query.getToBinCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsPutawayTask::getTaskNo, query.getKeyword()).or()
                        .like(WmsPutawayTask::getReceiptNo, query.getKeyword()).or()
                        .like(WmsPutawayTask::getMaterialCode, query.getKeyword()).or()
                        .like(WmsPutawayTask::getMaterialName, query.getKeyword()).or()
                        .like(WmsPutawayTask::getBatchNo, query.getKeyword()))
                .orderByDesc(WmsPutawayTask::getId));
        return PageResult.of(page);
    }

    public WmsPutawayTask detail(Long id) {
        return require(id);
    }

    /** 新增或更新上架任务记录：新增时回填默认上架状态、优先级与组织，上架任务号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, WmsPutawayTaskSaveRequest request) {
        WmsPutawayTask entity;
        if (id == null) {
            entity = new WmsPutawayTask();
            entity.setTaskNo(StringUtils.hasText(request.getTaskNo())
                    ? request.getTaskNo() : flowSupport.nextBizNo(DEFAULT_TASK_NO_PREFIX));
            entity.setPutawayStatus(StringUtils.hasText(request.getPutawayStatus())
                    ? request.getPutawayStatus() : DEFAULT_PUTAWAY_STATUS);
            entity.setTaskPriority(request.getTaskPriority() != null
                    ? request.getTaskPriority() : DEFAULT_TASK_PRIORITY);
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

    /** 删除上架任务记录：物理删除以释放上架任务号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public WmsPutawayTask require(Long id) {
        WmsPutawayTask entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "上架任务不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数量非空、日期非空、优先级非空）时覆盖实体对应字段。 */
    private void applyRequest(WmsPutawayTask entity, WmsPutawayTaskSaveRequest request) {
        if (StringUtils.hasText(request.getTaskNo())) {
            entity.setTaskNo(request.getTaskNo());
        }
        if (StringUtils.hasText(request.getReceiptNo())) {
            entity.setReceiptNo(request.getReceiptNo());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (request.getQty() != null) {
            entity.setQty(request.getQty());
        }
        if (StringUtils.hasText(request.getFromBinCode())) {
            entity.setFromBinCode(request.getFromBinCode());
        }
        if (StringUtils.hasText(request.getToBinCode())) {
            entity.setToBinCode(request.getToBinCode());
        }
        if (StringUtils.hasText(request.getStrategyCode())) {
            entity.setStrategyCode(request.getStrategyCode());
        }
        if (StringUtils.hasText(request.getOperator())) {
            entity.setOperator(request.getOperator());
        }
        if (request.getPutawayTime() != null) {
            entity.setPutawayTime(request.getPutawayTime());
        }
        if (request.getTaskPriority() != null) {
            entity.setTaskPriority(request.getTaskPriority());
        }
        if (StringUtils.hasText(request.getPutawayStatus())) {
            entity.setPutawayStatus(request.getPutawayStatus());
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
