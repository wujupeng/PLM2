package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.QualityDefectCodeQuery;
import com.huaweicloud.plm.system.dto.QualityDefectCodeSaveRequest;
import com.huaweicloud.plm.system.entity.QualityDefectCode;
import com.huaweicloud.plm.system.mapper.QualityDefectCodeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 缺陷代码库服务（DEV-049）。
 */
@Service
@RequiredArgsConstructor
public class QualityDefectCodeService {

    private static final String DEFAULT_SEVERITY = "minor";

    private final QualityDefectCodeMapper defectCodeMapper;

    public PageResult<QualityDefectCode> page(QualityDefectCodeQuery query) {
        Page<QualityDefectCode> page = query.toPage();
        defectCodeMapper.selectPage(page, Wrappers.<QualityDefectCode>lambdaQuery()
                .eq(StringUtils.hasText(query.getDefectCode()),
                        QualityDefectCode::getDefectCode, query.getDefectCode())
                .eq(StringUtils.hasText(query.getDefectCategory()),
                        QualityDefectCode::getDefectCategory, query.getDefectCategory())
                .eq(StringUtils.hasText(query.getOperationCode()),
                        QualityDefectCode::getOperationCode, query.getOperationCode())
                .eq(StringUtils.hasText(query.getSeverity()), QualityDefectCode::getSeverity, query.getSeverity())
                .eq(query.getStatus() != null, QualityDefectCode::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(QualityDefectCode::getDefectCode, query.getKeyword()).or()
                        .like(QualityDefectCode::getDefectName, query.getKeyword()))
                .orderByAsc(QualityDefectCode::getDefectCode)
                .orderByAsc(QualityDefectCode::getId));
        return PageResult.of(page);
    }

    public List<QualityDefectCode> options() {
        return defectCodeMapper.selectList(Wrappers.<QualityDefectCode>lambdaQuery()
                .orderByAsc(QualityDefectCode::getDefectCode)
                .orderByAsc(QualityDefectCode::getId));
    }

    public QualityDefectCode getById(Long defectCodeId) {
        return requireDefectCode(defectCodeId);
    }

    public Long create(QualityDefectCodeSaveRequest request) {
        if (defectCodeMapper.countByCode(request.getDefectCode(), -1L) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "缺陷代码已存在: " + request.getDefectCode());
        }
        QualityDefectCode defectCode = new QualityDefectCode();
        applyRequest(defectCode, request);
        defectCodeMapper.insert(defectCode);
        return defectCode.getId();
    }

    public void update(Long defectCodeId, QualityDefectCodeSaveRequest request) {
        QualityDefectCode defectCode = requireDefectCode(defectCodeId);
        if (!defectCode.getDefectCode().equals(request.getDefectCode())
                && defectCodeMapper.countByCode(request.getDefectCode(), defectCodeId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "缺陷代码已存在: " + request.getDefectCode());
        }
        applyRequest(defectCode, request);
        defectCodeMapper.updateById(defectCode);
    }

    public void delete(Long defectCodeId) {
        requireDefectCode(defectCodeId);
        defectCodeMapper.deleteById(defectCodeId);
    }

    private void applyRequest(QualityDefectCode defectCode, QualityDefectCodeSaveRequest request) {
        defectCode.setDefectCode(request.getDefectCode());
        defectCode.setDefectName(request.getDefectName());
        defectCode.setDefectCategory(request.getDefectCategory());
        defectCode.setOperationCode(request.getOperationCode());
        defectCode.setStation(request.getStation());
        defectCode.setResponsibleDept(request.getResponsibleDept());
        defectCode.setDefaultCause(request.getDefaultCause());
        defectCode.setDefaultAction(request.getDefaultAction());
        defectCode.setSeverity(StringUtils.hasText(request.getSeverity())
                ? request.getSeverity() : DEFAULT_SEVERITY);
        defectCode.setStatus(request.getStatus() == null ? 1 : request.getStatus());
        defectCode.setRemark(request.getRemark());
    }

    private QualityDefectCode requireDefectCode(Long defectCodeId) {
        QualityDefectCode defectCode = defectCodeMapper.selectById(defectCodeId);
        if (defectCode == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "缺陷代码不存在: " + defectCodeId);
        }
        return defectCode;
    }
}
