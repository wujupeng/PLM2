package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.HrVehicleQuery;
import com.huaweicloud.plm.system.dto.HrVehicleSaveRequest;
import com.huaweicloud.plm.system.entity.OaHrVehicle;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.mapper.OaHrVehicleMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 车辆档案管理（OA-DEV-058）：公司公务车辆基础信息维护。
 */
@Service
@RequiredArgsConstructor
public class OaHrVehicleService {

    public static final String STATUS_IDLE = "IDLE";
    public static final String STATUS_IN_USE = "IN_USE";
    public static final String STATUS_MAINTENANCE = "MAINTENANCE";
    public static final String STATUS_DISABLED = "DISABLED";

    private final OaHrVehicleMapper vehicleMapper;
    private final SysUserMapper userMapper;

    public PageResult<OaHrVehicle> page(HrVehicleQuery query) {
        Page<OaHrVehicle> page = query.toPage();
        vehicleMapper.selectPage(page, Wrappers.<OaHrVehicle>lambdaQuery()
                .eq(StringUtils.hasText(query.getVehicleStatus()),
                        OaHrVehicle::getVehicleStatus, query.getVehicleStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaHrVehicle::getVehicleCode, query.getKeyword()).or()
                        .like(OaHrVehicle::getPlateNo, query.getKeyword()).or()
                        .like(OaHrVehicle::getBrandModel, query.getKeyword()))
                .orderByAsc(OaHrVehicle::getVehicleCode));
        return PageResult.of(page);
    }

    /** 可派车列表：返回空闲车辆，供用车申请选择。 */
    public List<OaHrVehicle> listAll() {
        return vehicleMapper.selectList(Wrappers.<OaHrVehicle>lambdaQuery()
                .eq(OaHrVehicle::getVehicleStatus, STATUS_IDLE)
                .orderByAsc(OaHrVehicle::getVehicleCode));
    }

    public OaHrVehicle detail(Long id) {
        return requireVehicle(id);
    }

    @Transactional
    public Long create(HrVehicleSaveRequest request) {
        ensurePlateNoUnique(request.getPlateNo(), null);
        OaHrVehicle entity = new OaHrVehicle();
        apply(entity, request);
        if (!StringUtils.hasText(entity.getVehicleStatus())) {
            entity.setVehicleStatus(STATUS_IDLE);
        }
        vehicleMapper.insert(entity);
        return entity.getId();
    }

    @Transactional
    public void update(Long id, HrVehicleSaveRequest request) {
        OaHrVehicle entity = requireVehicle(id);
        ensurePlateNoUnique(request.getPlateNo(), id);
        apply(entity, request);
        vehicleMapper.updateById(entity);
    }

    @Transactional
    public void delete(Long id) {
        requireVehicle(id);
        vehicleMapper.deleteById(id);
    }

    public OaHrVehicle requireVehicle(Long id) {
        OaHrVehicle entity = vehicleMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "车辆不存在: " + id);
        }
        return entity;
    }

    private void ensurePlateNoUnique(String plateNo, Long excludeId) {
        if (!StringUtils.hasText(plateNo)) {
            return;
        }
        Long count = vehicleMapper.selectCount(Wrappers.<OaHrVehicle>lambdaQuery()
                .eq(OaHrVehicle::getPlateNo, plateNo)
                .ne(excludeId != null, OaHrVehicle::getId, excludeId));
        if (count != null && count > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "车牌号已存在: " + plateNo);
        }
    }

    private void apply(OaHrVehicle entity, HrVehicleSaveRequest request) {
        entity.setVehicleCode(request.getVehicleCode());
        entity.setPlateNo(request.getPlateNo());
        entity.setVehicleType(request.getVehicleType());
        entity.setBrandModel(request.getBrandModel());
        entity.setSeatCount(request.getSeatCount());
        entity.setDriverUserId(request.getDriverUserId());
        entity.setDriverName(resolveUserName(request.getDriverUserId()));
        if (StringUtils.hasText(request.getVehicleStatus())) {
            entity.setVehicleStatus(request.getVehicleStatus());
        }
        entity.setRemark(request.getRemark());
    }

    private String resolveUserName(Long userId) {
        if (userId == null) {
            return null;
        }
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            return null;
        }
        return StringUtils.hasText(user.getDisplayName()) ? user.getDisplayName() : user.getUsername();
    }
}
