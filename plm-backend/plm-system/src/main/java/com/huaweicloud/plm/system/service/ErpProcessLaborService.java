package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpProcessLaborQuery;
import com.huaweicloud.plm.system.dto.ErpProcessLaborSaveRequest;
import com.huaweicloud.plm.system.entity.ErpProcessLabor;
import com.huaweicloud.plm.system.mapper.ErpProcessLaborMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 工艺资源—工时反馈（对应 G3-N7b ERP 工艺资源—工时反馈）：
 * 工时反馈登记、分页查询与删除。
 * 反馈单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpProcessLaborService {

    private static final String DEFAULT_FEEDBACK_NO_PREFIX = "FBK";
    private static final String DEFAULT_LABOR_TYPE = "RUN";
    private static final String DEFAULT_LABOR_STATUS = "DRAFT";

    private final ErpProcessLaborMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询工时反馈：工时类型/工时状态/计划单号精确，反馈单号/计划单号/报工单号/资源编码/操作工模糊，按主键倒序。 */
    public PageResult<ErpProcessLabor> page(ErpProcessLaborQuery query) {
        Page<ErpProcessLabor> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpProcessLabor>lambdaQuery()
                .eq(StringUtils.hasText(query.getLaborType()),
                        ErpProcessLabor::getLaborType, query.getLaborType())
                .eq(StringUtils.hasText(query.getLaborStatus()),
                        ErpProcessLabor::getLaborStatus, query.getLaborStatus())
                .eq(StringUtils.hasText(query.getPlanNo()),
                        ErpProcessLabor::getPlanNo, query.getPlanNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpProcessLabor::getFeedbackNo, query.getKeyword()).or()
                        .like(ErpProcessLabor::getPlanNo, query.getKeyword()).or()
                        .like(ErpProcessLabor::getReportNo, query.getKeyword()).or()
                        .like(ErpProcessLabor::getResourceCode, query.getKeyword()).or()
                        .like(ErpProcessLabor::getOperatorName, query.getKeyword()))
                .orderByDesc(ErpProcessLabor::getId));
        return PageResult.of(page);
    }

    public ErpProcessLabor detail(Long id) {
        return require(id);
    }

    /** 新增或更新工时反馈：新增时回填默认工时类型/工时状态/标准工时/实际工时与组织，反馈单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpProcessLaborSaveRequest request) {
        ErpProcessLabor entity;
        if (id == null) {
            entity = new ErpProcessLabor();
            entity.setFeedbackNo(StringUtils.hasText(request.getFeedbackNo())
                    ? request.getFeedbackNo() : flowSupport.nextBizNo(DEFAULT_FEEDBACK_NO_PREFIX));
            entity.setLaborType(StringUtils.hasText(request.getLaborType())
                    ? request.getLaborType() : DEFAULT_LABOR_TYPE);
            entity.setLaborStatus(StringUtils.hasText(request.getLaborStatus())
                    ? request.getLaborStatus() : DEFAULT_LABOR_STATUS);
            entity.setStandardHours(request.getStandardHours() != null
                    ? request.getStandardHours() : BigDecimal.ZERO);
            entity.setActualHours(request.getActualHours() != null
                    ? request.getActualHours() : BigDecimal.ZERO);
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

    /** 删除工时反馈：物理删除以释放反馈单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpProcessLabor require(Long id) {
        ErpProcessLabor entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "工时反馈不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpProcessLabor entity, ErpProcessLaborSaveRequest request) {
        if (StringUtils.hasText(request.getFeedbackNo())) {
            entity.setFeedbackNo(request.getFeedbackNo());
        }
        if (StringUtils.hasText(request.getPlanNo())) {
            entity.setPlanNo(request.getPlanNo());
        }
        if (StringUtils.hasText(request.getReportNo())) {
            entity.setReportNo(request.getReportNo());
        }
        if (StringUtils.hasText(request.getResourceCode())) {
            entity.setResourceCode(request.getResourceCode());
        }
        if (StringUtils.hasText(request.getOperatorName())) {
            entity.setOperatorName(request.getOperatorName());
        }
        if (StringUtils.hasText(request.getLaborType())) {
            entity.setLaborType(request.getLaborType());
        }
        if (request.getStandardHours() != null) {
            entity.setStandardHours(request.getStandardHours());
        }
        if (request.getActualHours() != null) {
            entity.setActualHours(request.getActualHours());
        }
        if (request.getStartTime() != null) {
            entity.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            entity.setEndTime(request.getEndTime());
        }
        if (StringUtils.hasText(request.getLaborStatus())) {
            entity.setLaborStatus(request.getLaborStatus());
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
