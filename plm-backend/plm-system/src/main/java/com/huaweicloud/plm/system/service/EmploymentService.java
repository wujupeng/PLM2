package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.EmploymentQuery;
import com.huaweicloud.plm.system.dto.EmploymentSaveRequest;
import com.huaweicloud.plm.system.entity.SysEmployment;
import com.huaweicloud.plm.system.entity.SysPosition;
import com.huaweicloud.plm.system.mapper.SysEmploymentMapper;
import com.huaweicloud.plm.system.mapper.SysPositionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class EmploymentService {

    private final SysEmploymentMapper employmentMapper;
    private final SysPositionMapper positionMapper;

    public PageResult<SysEmployment> page(EmploymentQuery query) {
        Page<SysEmployment> page = query.toPage();
        employmentMapper.selectPage(page, Wrappers.<SysEmployment>lambdaQuery()
                .eq(query.getOrgId() != null, SysEmployment::getOrgId, query.getOrgId())
                .eq(query.getPositionId() != null, SysEmployment::getPositionId, query.getPositionId())
                .eq(StringUtils.hasText(query.getEmploymentStatus()),
                        SysEmployment::getEmploymentStatus, query.getEmploymentStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysEmployment::getEmployeeNo, query.getKeyword()).or()
                        .like(SysEmployment::getEmployeeName, query.getKeyword()))
                .orderByAsc(SysEmployment::getEmployeeNo));
        return PageResult.of(page);
    }

    public Long create(EmploymentSaveRequest request) {
        if (employmentMapper.countByNo(request.getEmployeeNo(), -1L) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "工号已存在: " + request.getEmployeeNo());
        }
        SysEmployment employment = new SysEmployment();
        applyRequest(employment, request);
        employmentMapper.insert(employment);
        return employment.getId();
    }

    public void update(Long employmentId, EmploymentSaveRequest request) {
        SysEmployment employment = requireEmployment(employmentId);
        if (employmentMapper.countByNo(request.getEmployeeNo(), employmentId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "工号已存在: " + request.getEmployeeNo());
        }
        applyRequest(employment, request);
        employmentMapper.updateById(employment);
    }

    public void delete(Long employmentId) {
        requireEmployment(employmentId);
        employmentMapper.deleteById(employmentId);
    }

    private SysEmployment requireEmployment(Long employmentId) {
        SysEmployment employment = employmentMapper.selectById(employmentId);
        if (employment == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "员工档案不存在: " + employmentId);
        }
        return employment;
    }

    private void applyRequest(SysEmployment employment, EmploymentSaveRequest request) {
        employment.setEmployeeNo(request.getEmployeeNo());
        employment.setUserId(request.getUserId());
        employment.setEmployeeName(request.getEmployeeName());
        employment.setOrgId(request.getOrgId());
        employment.setPositionId(request.getPositionId());
        employment.setPositionName(resolvePositionName(request));
        employment.setEmploymentType(StringUtils.hasText(request.getEmploymentType())
                ? request.getEmploymentType() : "FULL_TIME");
        employment.setEmploymentStatus(StringUtils.hasText(request.getEmploymentStatus())
                ? request.getEmploymentStatus() : "ACTIVE");
        employment.setHireDate(request.getHireDate());
        employment.setLeaveDate(request.getLeaveDate());
        employment.setManagerUserId(request.getManagerUserId());
        employment.setWorkLocation(request.getWorkLocation());
        employment.setRemark(request.getRemark());
    }

    /** 岗位名称以岗位表为准，未选择岗位时沿用入参。 */
    private String resolvePositionName(EmploymentSaveRequest request) {
        if (request.getPositionId() == null) {
            return request.getPositionName();
        }
        SysPosition position = positionMapper.selectById(request.getPositionId());
        return position == null ? request.getPositionName() : position.getPositionName();
    }
}
