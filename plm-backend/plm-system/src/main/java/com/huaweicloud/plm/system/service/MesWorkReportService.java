package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesWorkReportQuery;
import com.huaweicloud.plm.system.dto.MesWorkReportSaveRequest;
import com.huaweicloud.plm.system.entity.MesWorkReport;
import com.huaweicloud.plm.system.mapper.MesWorkReportMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 工序报工单服务。
 */
@Service
@RequiredArgsConstructor
public class MesWorkReportService {

    private static final String DEFAULT_NO_PREFIX = "MWR";
    private static final String DEFAULT_REPORT_TYPE = "START";
    private static final String DEFAULT_REPORT_STATUS = "DRAFT";

    private final MesWorkReportMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesWorkReport> page(MesWorkReportQuery query) {
        String keyword = query.getKeyword();
        Page<MesWorkReport> page = mapper.selectPage(query.toPage(), Wrappers.<MesWorkReport>lambdaQuery()
                .eq(StringUtils.hasText(query.getReportStatus()), MesWorkReport::getReportStatus, query.getReportStatus())
                .eq(StringUtils.hasText(query.getReportType()), MesWorkReport::getReportType, query.getReportType())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), MesWorkReport::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getDispatchNo()), MesWorkReport::getDispatchNo, query.getDispatchNo())
                .eq(StringUtils.hasText(query.getProcessCode()), MesWorkReport::getProcessCode, query.getProcessCode())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesWorkReport::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesWorkReport::getReportNo, keyword).or()
                        .like(MesWorkReport::getWorkOrderNo, keyword).or()
                        .like(MesWorkReport::getDispatchNo, keyword).or()
                        .like(MesWorkReport::getProcessCode, keyword).or()
                        .like(MesWorkReport::getMaterialCode, keyword).or()
                        .like(MesWorkReport::getMaterialName, keyword))
                .orderByDesc(MesWorkReport::getId));
        return PageResult.of(page);
    }

    public MesWorkReport detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesWorkReportSaveRequest request) {
        MesWorkReport entity;
        if (id == null) {
            entity = new MesWorkReport();
            entity.setReportNo(StringUtils.hasText(request.getReportNo())
                    ? request.getReportNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setReportType(StringUtils.hasText(request.getReportType())
                    ? request.getReportType() : DEFAULT_REPORT_TYPE);
            entity.setReportStatus(StringUtils.hasText(request.getReportStatus())
                    ? request.getReportStatus() : DEFAULT_REPORT_STATUS);
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

    private MesWorkReport require(Long id) {
        MesWorkReport entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "工序报工单不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesWorkReport entity, MesWorkReportSaveRequest request) {
        if (StringUtils.hasText(request.getReportNo())) {
            entity.setReportNo(request.getReportNo());
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
        if (StringUtils.hasText(request.getProcessName())) {
            entity.setProcessName(request.getProcessName());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getEquipmentCode())) {
            entity.setEquipmentCode(request.getEquipmentCode());
        }
        if (StringUtils.hasText(request.getLineCode())) {
            entity.setLineCode(request.getLineCode());
        }
        if (StringUtils.hasText(request.getOperator())) {
            entity.setOperator(request.getOperator());
        }
        if (StringUtils.hasText(request.getShiftCode())) {
            entity.setShiftCode(request.getShiftCode());
        }
        if (StringUtils.hasText(request.getReportType())) {
            entity.setReportType(request.getReportType());
        }
        if (request.getGoodQty() != null) {
            entity.setGoodQty(request.getGoodQty());
        }
        if (request.getBadQty() != null) {
            entity.setBadQty(request.getBadQty());
        }
        if (request.getReworkQty() != null) {
            entity.setReworkQty(request.getReworkQty());
        }
        if (request.getReportQty() != null) {
            entity.setReportQty(request.getReportQty());
        }
        if (request.getStartTime() != null) {
            entity.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            entity.setEndTime(request.getEndTime());
        }
        if (request.getDurationMinutes() != null) {
            entity.setDurationMinutes(request.getDurationMinutes());
        }
        if (request.getWorkHours() != null) {
            entity.setWorkHours(request.getWorkHours());
        }
        if (StringUtils.hasText(request.getReportStatus())) {
            entity.setReportStatus(request.getReportStatus());
        }
        if (request.getReportTime() != null) {
            entity.setReportTime(request.getReportTime());
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
