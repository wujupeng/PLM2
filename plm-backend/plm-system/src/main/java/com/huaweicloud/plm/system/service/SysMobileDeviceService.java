package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MobileDeviceQuery;
import com.huaweicloud.plm.system.dto.MobileDeviceSaveRequest;
import com.huaweicloud.plm.system.entity.SysMobileDevice;
import com.huaweicloud.plm.system.mapper.SysMobileDeviceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * PDA 设备（G1-N6 公共平台底座—通用能力 WBS T106 移动端与PDA）：
 * 设备登记、分页查询、启停状态流转与删除。
 * 设备编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysMobileDeviceService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";
    private static final String DEFAULT_DEVICE_TYPE = "PDA";

    private final SysMobileDeviceMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询设备：设备类型/状态精确，编号/名称/型号/绑定用户模糊，按编号倒序。 */
    public PageResult<SysMobileDevice> pageDevices(MobileDeviceQuery query) {
        Page<SysMobileDevice> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysMobileDevice>lambdaQuery()
                .eq(StringUtils.hasText(query.getDeviceType()),
                        SysMobileDevice::getDeviceType, query.getDeviceType())
                .eq(StringUtils.hasText(query.getDeviceStatus()),
                        SysMobileDevice::getDeviceStatus, query.getDeviceStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysMobileDevice::getDeviceNo, query.getKeyword()).or()
                        .like(SysMobileDevice::getDeviceName, query.getKeyword()).or()
                        .like(SysMobileDevice::getDeviceModel, query.getKeyword()).or()
                        .like(SysMobileDevice::getBindUserName, query.getKeyword()))
                .orderByDesc(SysMobileDevice::getId));
        return PageResult.of(page);
    }

    public SysMobileDevice detail(Long id) {
        return require(id);
    }

    /** 新增或更新设备：新增时回填默认设备类型/状态与组织，设备编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, MobileDeviceSaveRequest request) {
        SysMobileDevice entity;
        if (id == null) {
            entity = new SysMobileDevice();
            entity.setDeviceNo(StringUtils.hasText(request.getDeviceNo())
                    ? request.getDeviceNo() : flowSupport.nextBizNo("MDV"));
            entity.setDeviceType(StringUtils.hasText(request.getDeviceType())
                    ? request.getDeviceType() : DEFAULT_DEVICE_TYPE);
            entity.setDeviceStatus(StringUtils.hasText(request.getDeviceStatus())
                    ? request.getDeviceStatus() : STATUS_ACTIVE);
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

    /** 启用：设备状态置为 ACTIVE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysMobileDevice enable(Long id) {
        return changeDeviceStatus(id, STATUS_ACTIVE);
    }

    /** 停用：设备状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysMobileDevice disable(Long id) {
        return changeDeviceStatus(id, STATUS_DISABLED);
    }

    /** 删除设备：物理删除以释放设备编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysMobileDevice require(Long id) {
        SysMobileDevice entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "PDA设备不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysMobileDevice entity, MobileDeviceSaveRequest request) {
        if (StringUtils.hasText(request.getDeviceNo())) {
            entity.setDeviceNo(request.getDeviceNo());
        }
        if (StringUtils.hasText(request.getDeviceName())) {
            entity.setDeviceName(request.getDeviceName());
        }
        if (StringUtils.hasText(request.getDeviceType())) {
            entity.setDeviceType(request.getDeviceType());
        }
        if (StringUtils.hasText(request.getDeviceModel())) {
            entity.setDeviceModel(request.getDeviceModel());
        }
        if (StringUtils.hasText(request.getDeviceStatus())) {
            entity.setDeviceStatus(request.getDeviceStatus());
        }
        if (request.getBindUserId() != null) {
            entity.setBindUserId(request.getBindUserId());
        }
        if (StringUtils.hasText(request.getBindUserName())) {
            entity.setBindUserName(request.getBindUserName());
        }
        if (request.getLastActiveTime() != null) {
            entity.setLastActiveTime(request.getLastActiveTime());
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

    private SysMobileDevice changeDeviceStatus(Long id, String deviceStatus) {
        SysMobileDevice entity = require(id);
        entity.setDeviceStatus(deviceStatus);
        mapper.updateById(entity);
        return entity;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
