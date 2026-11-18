package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmAsnQuery;
import com.huaweicloud.plm.system.dto.SrmAsnSaveRequest;
import com.huaweicloud.plm.system.entity.SrmAsn;
import com.huaweicloud.plm.system.mapper.SrmAsnMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 采购协同—ASN 发货通知（对应 ASN 发货通知）：
 * 发货通知登记、分页查询与删除。
 * 发货通知编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmAsnService {

    private static final String DEFAULT_ASN_NO_PREFIX = "ASN";
    private static final String DEFAULT_ASN_STATUS = "DRAFT";

    private final SrmAsnMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询发货通知记录：发货状态/供应商编码/采购订单号精确，发货通知编号/送货预约编号/采购订单号/供应商编码/供应商名称/运单号模糊，按主键倒序。 */
    public PageResult<SrmAsn> page(SrmAsnQuery query) {
        Page<SrmAsn> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmAsn>lambdaQuery()
                .eq(StringUtils.hasText(query.getAsnStatus()),
                        SrmAsn::getAsnStatus, query.getAsnStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmAsn::getSupplierCode, query.getSupplierCode())
                .eq(StringUtils.hasText(query.getPoNo()),
                        SrmAsn::getPoNo, query.getPoNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmAsn::getAsnNo, query.getKeyword()).or()
                        .like(SrmAsn::getAppointmentNo, query.getKeyword()).or()
                        .like(SrmAsn::getPoNo, query.getKeyword()).or()
                        .like(SrmAsn::getSupplierCode, query.getKeyword()).or()
                        .like(SrmAsn::getSupplierName, query.getKeyword()).or()
                        .like(SrmAsn::getTrackingNo, query.getKeyword()))
                .orderByDesc(SrmAsn::getId));
        return PageResult.of(page);
    }

    public SrmAsn detail(Long id) {
        return require(id);
    }

    /** 新增或更新发货通知记录：新增时回填默认发货状态与组织，发货通知编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmAsnSaveRequest request) {
        SrmAsn entity;
        if (id == null) {
            entity = new SrmAsn();
            entity.setAsnNo(StringUtils.hasText(request.getAsnNo())
                    ? request.getAsnNo() : flowSupport.nextBizNo(DEFAULT_ASN_NO_PREFIX));
            entity.setAsnStatus(StringUtils.hasText(request.getAsnStatus())
                    ? request.getAsnStatus() : DEFAULT_ASN_STATUS);
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

    /** 删除发货通知记录：物理删除以释放发货通知编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmAsn require(Long id) {
        SrmAsn entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "ASN 发货通知不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmAsn entity, SrmAsnSaveRequest request) {
        if (StringUtils.hasText(request.getAsnNo())) {
            entity.setAsnNo(request.getAsnNo());
        }
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
        if (request.getShipQty() != null) {
            entity.setShipQty(request.getShipQty());
        }
        if (StringUtils.hasText(request.getUnit())) {
            entity.setUnit(request.getUnit());
        }
        if (request.getShipDate() != null) {
            entity.setShipDate(request.getShipDate());
        }
        if (request.getArriveDate() != null) {
            entity.setArriveDate(request.getArriveDate());
        }
        if (StringUtils.hasText(request.getCarrier())) {
            entity.setCarrier(request.getCarrier());
        }
        if (StringUtils.hasText(request.getTrackingNo())) {
            entity.setTrackingNo(request.getTrackingNo());
        }
        if (StringUtils.hasText(request.getVehicleNo())) {
            entity.setVehicleNo(request.getVehicleNo());
        }
        if (request.getPackageCount() != null) {
            entity.setPackageCount(request.getPackageCount());
        }
        if (StringUtils.hasText(request.getAsnBy())) {
            entity.setAsnBy(request.getAsnBy());
        }
        if (request.getAsnDate() != null) {
            entity.setAsnDate(request.getAsnDate());
        }
        if (StringUtils.hasText(request.getAsnStatus())) {
            entity.setAsnStatus(request.getAsnStatus());
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
