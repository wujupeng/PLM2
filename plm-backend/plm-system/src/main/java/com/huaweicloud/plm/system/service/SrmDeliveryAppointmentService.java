package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmDeliveryAppointmentQuery;
import com.huaweicloud.plm.system.dto.SrmDeliveryAppointmentSaveRequest;
import com.huaweicloud.plm.system.entity.SrmDeliveryAppointment;
import com.huaweicloud.plm.system.mapper.SrmDeliveryAppointmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 采购协同—送货预约（对应送货预约）：
 * 送货预约登记、分页查询与删除。
 * 送货预约编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmDeliveryAppointmentService {

    private static final String DEFAULT_APPOINTMENT_NO_PREFIX = "APT";
    private static final String DEFAULT_APPOINTMENT_STATUS = "PENDING";

    private final SrmDeliveryAppointmentMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询送货预约记录：预约状态/供应商编码/采购订单号精确，送货预约编号/采购订单号/供应商编码/供应商名称/车辆车牌号模糊，按主键倒序。 */
    public PageResult<SrmDeliveryAppointment> page(SrmDeliveryAppointmentQuery query) {
        Page<SrmDeliveryAppointment> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmDeliveryAppointment>lambdaQuery()
                .eq(StringUtils.hasText(query.getAppointmentStatus()),
                        SrmDeliveryAppointment::getAppointmentStatus, query.getAppointmentStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmDeliveryAppointment::getSupplierCode, query.getSupplierCode())
                .eq(StringUtils.hasText(query.getPoNo()),
                        SrmDeliveryAppointment::getPoNo, query.getPoNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmDeliveryAppointment::getAppointmentNo, query.getKeyword()).or()
                        .like(SrmDeliveryAppointment::getPoNo, query.getKeyword()).or()
                        .like(SrmDeliveryAppointment::getSupplierCode, query.getKeyword()).or()
                        .like(SrmDeliveryAppointment::getSupplierName, query.getKeyword()).or()
                        .like(SrmDeliveryAppointment::getVehicleNo, query.getKeyword()))
                .orderByDesc(SrmDeliveryAppointment::getId));
        return PageResult.of(page);
    }

    public SrmDeliveryAppointment detail(Long id) {
        return require(id);
    }

    /** 新增或更新送货预约记录：新增时回填默认预约状态与组织，送货预约编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmDeliveryAppointmentSaveRequest request) {
        SrmDeliveryAppointment entity;
        if (id == null) {
            entity = new SrmDeliveryAppointment();
            entity.setAppointmentNo(StringUtils.hasText(request.getAppointmentNo())
                    ? request.getAppointmentNo() : flowSupport.nextBizNo(DEFAULT_APPOINTMENT_NO_PREFIX));
            entity.setAppointmentStatus(StringUtils.hasText(request.getAppointmentStatus())
                    ? request.getAppointmentStatus() : DEFAULT_APPOINTMENT_STATUS);
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

    /** 删除送货预约记录：物理删除以释放送货预约编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmDeliveryAppointment require(Long id) {
        SrmDeliveryAppointment entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "送货预约单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmDeliveryAppointment entity, SrmDeliveryAppointmentSaveRequest request) {
        if (StringUtils.hasText(request.getAppointmentNo())) {
            entity.setAppointmentNo(request.getAppointmentNo());
        }
        if (StringUtils.hasText(request.getPoNo())) {
            entity.setPoNo(request.getPoNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getSpec())) {
            entity.setSpec(request.getSpec());
        }
        if (request.getAppointQty() != null) {
            entity.setAppointQty(request.getAppointQty());
        }
        if (StringUtils.hasText(request.getUnit())) {
            entity.setUnit(request.getUnit());
        }
        if (request.getDeliveryDate() != null) {
            entity.setDeliveryDate(request.getDeliveryDate());
        }
        if (StringUtils.hasText(request.getTimeSlot())) {
            entity.setTimeSlot(request.getTimeSlot());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getWarehouseName())) {
            entity.setWarehouseName(request.getWarehouseName());
        }
        if (StringUtils.hasText(request.getVehicleNo())) {
            entity.setVehicleNo(request.getVehicleNo());
        }
        if (StringUtils.hasText(request.getDriver())) {
            entity.setDriver(request.getDriver());
        }
        if (StringUtils.hasText(request.getDriverPhone())) {
            entity.setDriverPhone(request.getDriverPhone());
        }
        if (StringUtils.hasText(request.getAppointBy())) {
            entity.setAppointBy(request.getAppointBy());
        }
        if (request.getAppointDate() != null) {
            entity.setAppointDate(request.getAppointDate());
        }
        if (StringUtils.hasText(request.getAppointmentStatus())) {
            entity.setAppointmentStatus(request.getAppointmentStatus());
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
