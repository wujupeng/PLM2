package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IntgLabelTraceBatchQuery;
import com.huaweicloud.plm.system.dto.IntgLabelTraceBatchSaveRequest;
import com.huaweicloud.plm.system.entity.IntgLabelTraceBatch;
import com.huaweicloud.plm.system.mapper.IntgLabelTraceBatchMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 标签追溯同步批次服务：集成同步批次的登记、分页查询与删除。
 * 批次编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class IntgLabelTraceBatchService {

    private static final String DEFAULT_NO_PREFIX = "LTB";
    private static final String DEFAULT_DIRECTION = "TRACE_TO_SYSTEMS";
    private static final String DEFAULT_OBJECT_TYPE = "DATA_MATRIX";
    private static final String DEFAULT_TRIGGER_TYPE = "MANUAL";
    private static final Integer DEFAULT_COUNT = 0;
    private static final String DEFAULT_BATCH_STATUS = "PENDING";

    private final IntgLabelTraceBatchMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询同步批次：对象类型/状态/接口编号精确，批次编号/名称/消息模糊，按主键倒序。 */
    public PageResult<IntgLabelTraceBatch> page(IntgLabelTraceBatchQuery query) {
        String keyword = query.getKeyword();
        Page<IntgLabelTraceBatch> page = mapper.selectPage(query.toPage(), Wrappers.<IntgLabelTraceBatch>lambdaQuery()
                .eq(StringUtils.hasText(query.getObjectType()), IntgLabelTraceBatch::getObjectType, query.getObjectType())
                .eq(StringUtils.hasText(query.getBatchStatus()), IntgLabelTraceBatch::getBatchStatus, query.getBatchStatus())
                .eq(StringUtils.hasText(query.getInterfaceNo()), IntgLabelTraceBatch::getInterfaceNo, query.getInterfaceNo())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(IntgLabelTraceBatch::getBatchNo, keyword).or()
                        .like(IntgLabelTraceBatch::getBatchName, keyword).or()
                        .like(IntgLabelTraceBatch::getMessage, keyword))
                .orderByDesc(IntgLabelTraceBatch::getId));
        return PageResult.of(page);
    }

    public IntgLabelTraceBatch detail(Long id) {
        return require(id);
    }

    /** 新增或更新同步批次：新增时回填默认方向、对象类型、触发方式、计数、状态与组织，编号为空时自动生成。 */
    public Long save(Long id, IntgLabelTraceBatchSaveRequest request) {
        IntgLabelTraceBatch entity;
        if (id == null) {
            entity = new IntgLabelTraceBatch();
            entity.setBatchNo(StringUtils.hasText(request.getBatchNo())
                    ? request.getBatchNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setDirection(StringUtils.hasText(request.getDirection())
                    ? request.getDirection() : DEFAULT_DIRECTION);
            entity.setObjectType(StringUtils.hasText(request.getObjectType())
                    ? request.getObjectType() : DEFAULT_OBJECT_TYPE);
            entity.setTriggerType(StringUtils.hasText(request.getTriggerType())
                    ? request.getTriggerType() : DEFAULT_TRIGGER_TYPE);
            entity.setTotalCount(request.getTotalCount() == null ? DEFAULT_COUNT : request.getTotalCount());
            entity.setSuccessCount(request.getSuccessCount() == null ? DEFAULT_COUNT : request.getSuccessCount());
            entity.setFailCount(request.getFailCount() == null ? DEFAULT_COUNT : request.getFailCount());
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

    /** 删除同步批次：物理删除以释放批次编号。 */
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    private IntgLabelTraceBatch require(Long id) {
        IntgLabelTraceBatch entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "同步批次不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值时覆盖实体对应字段：字符串非空，数值/时间非 null。 */
    private void applyRequest(IntgLabelTraceBatch entity, IntgLabelTraceBatchSaveRequest request) {
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (StringUtils.hasText(request.getBatchName())) {
            entity.setBatchName(request.getBatchName());
        }
        if (StringUtils.hasText(request.getInterfaceNo())) {
            entity.setInterfaceNo(request.getInterfaceNo());
        }
        if (StringUtils.hasText(request.getDirection())) {
            entity.setDirection(request.getDirection());
        }
        if (StringUtils.hasText(request.getObjectType())) {
            entity.setObjectType(request.getObjectType());
        }
        if (StringUtils.hasText(request.getTriggerType())) {
            entity.setTriggerType(request.getTriggerType());
        }
        if (request.getTotalCount() != null) {
            entity.setTotalCount(request.getTotalCount());
        }
        if (request.getSuccessCount() != null) {
            entity.setSuccessCount(request.getSuccessCount());
        }
        if (request.getFailCount() != null) {
            entity.setFailCount(request.getFailCount());
        }
        if (request.getStartTime() != null) {
            entity.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            entity.setEndTime(request.getEndTime());
        }
        if (StringUtils.hasText(request.getBatchStatus())) {
            entity.setBatchStatus(request.getBatchStatus());
        }
        if (StringUtils.hasText(request.getMessage())) {
            entity.setMessage(request.getMessage());
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
