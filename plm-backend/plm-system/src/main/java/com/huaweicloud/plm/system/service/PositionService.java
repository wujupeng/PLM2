package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.PositionQuery;
import com.huaweicloud.plm.system.dto.PositionSaveRequest;
import com.huaweicloud.plm.system.entity.SysPosition;
import com.huaweicloud.plm.system.mapper.SysPositionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PositionService {

    private final SysPositionMapper positionMapper;

    public PageResult<SysPosition> page(PositionQuery query) {
        Page<SysPosition> page = query.toPage();
        positionMapper.selectPage(page, Wrappers.<SysPosition>lambdaQuery()
                .eq(query.getOrgId() != null, SysPosition::getOrgId, query.getOrgId())
                .eq(query.getStatus() != null, SysPosition::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysPosition::getPositionCode, query.getKeyword()).or()
                        .like(SysPosition::getPositionName, query.getKeyword()))
                .orderByAsc(SysPosition::getSortNo));
        return PageResult.of(page);
    }

    /** 供员工档案等页面下拉使用，仅返回启用岗位。 */
    public List<SysPosition> listEnabled() {
        return positionMapper.selectList(Wrappers.<SysPosition>lambdaQuery()
                .eq(SysPosition::getStatus, 1)
                .orderByAsc(SysPosition::getSortNo));
    }

    public Long create(PositionSaveRequest request) {
        if (positionMapper.countByCode(request.getPositionCode(), -1L) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "岗位编码已存在: " + request.getPositionCode());
        }
        SysPosition position = new SysPosition();
        applyRequest(position, request);
        positionMapper.insert(position);
        return position.getId();
    }

    public void update(Long positionId, PositionSaveRequest request) {
        SysPosition position = requirePosition(positionId);
        if (positionMapper.countByCode(request.getPositionCode(), positionId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "岗位编码已存在: " + request.getPositionCode());
        }
        applyRequest(position, request);
        positionMapper.updateById(position);
    }

    public void delete(Long positionId) {
        requirePosition(positionId);
        positionMapper.deleteById(positionId);
    }

    public SysPosition requirePosition(Long positionId) {
        SysPosition position = positionMapper.selectById(positionId);
        if (position == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "岗位不存在: " + positionId);
        }
        return position;
    }

    private void applyRequest(SysPosition position, PositionSaveRequest request) {
        position.setPositionCode(request.getPositionCode());
        position.setPositionName(request.getPositionName());
        position.setOrgId(request.getOrgId());
        position.setPositionLevel(StringUtils.hasText(request.getPositionLevel())
                ? request.getPositionLevel() : "STAFF");
        position.setSortNo(request.getSortNo() == null ? 0 : request.getSortNo());
        position.setStatus(request.getStatus() == null ? 1 : request.getStatus());
        position.setRemark(request.getRemark());
    }
}
