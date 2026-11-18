package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesLaborHourQuery;
import com.huaweicloud.plm.system.dto.MesLaborHourSaveRequest;
import com.huaweicloud.plm.system.entity.MesLaborHour;
import com.huaweicloud.plm.system.mapper.MesLaborHourMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * MES 工时记录服务。
 */
@Service
@RequiredArgsConstructor
public class MesLaborHourService {

    private static final String DEFAULT_NO_PREFIX = "MLH";
    private static final String DEFAULT_LABOR_STATUS = "DRAFT";

    private final MesLaborHourMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesLaborHour> page(MesLaborHourQuery query) {
        String keyword = query.getKeyword();
        Page<MesLaborHour> page = mapper.selectPage(query.toPage(), Wrappers.<MesLaborHour>lambdaQuery()
                .eq(StringUtils.hasText(query.getLaborStatus()), MesLaborHour::getLaborStatus, query.getLaborStatus())
                .eq(StringUtils.hasText(query.getWorker()), MesLaborHour::getWorker, query.getWorker())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), MesLaborHour::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesLaborHour::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesLaborHour::getLaborNo, keyword).or()
                        .like(MesLaborHour::getWorkOrderNo, keyword).or()
                        .like(MesLaborHour::getWorker, keyword).or()
                        .like(MesLaborHour::getMaterialCode, keyword).or()
                        .like(MesLaborHour::getMaterialName, keyword))
                .orderByDesc(MesLaborHour::getId));
        return PageResult.of(page);
    }

    public MesLaborHour detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesLaborHourSaveRequest request) {
        MesLaborHour entity;
        if (id == null) {
            entity = new MesLaborHour();
            entity.setLaborNo(StringUtils.hasText(request.getLaborNo())
                    ? request.getLaborNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setLaborStatus(StringUtils.hasText(request.getLaborStatus())
                    ? request.getLaborStatus() : DEFAULT_LABOR_STATUS);
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

    private MesLaborHour require(Long id) {
        MesLaborHour entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "工时记录不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesLaborHour entity, MesLaborHourSaveRequest request) {
        if (StringUtils.hasText(request.getLaborNo())) {
            entity.setLaborNo(request.getLaborNo());
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
        if (StringUtils.hasText(request.getWorker())) {
            entity.setWorker(request.getWorker());
        }
        if (StringUtils.hasText(request.getShiftCode())) {
            entity.setShiftCode(request.getShiftCode());
        }
        if (request.getWorkDate() != null) {
            entity.setWorkDate(request.getWorkDate());
        }
        if (request.getNormalHours() != null) {
            entity.setNormalHours(request.getNormalHours());
        }
        if (request.getOvertimeHours() != null) {
            entity.setOvertimeHours(request.getOvertimeHours());
        }
        if (request.getTotalHours() != null) {
            entity.setTotalHours(request.getTotalHours());
        }
        if (StringUtils.hasText(request.getLaborStatus())) {
            entity.setLaborStatus(request.getLaborStatus());
        }
        if (request.getConfirmTime() != null) {
            entity.setConfirmTime(request.getConfirmTime());
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
