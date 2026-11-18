package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsVmiBinQuery;
import com.huaweicloud.plm.system.dto.WmsVmiBinSaveRequest;
import com.huaweicloud.plm.system.entity.WmsVmiBin;
import com.huaweicloud.plm.system.mapper.WmsVmiBinMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * VMI 库位服务。
 */
@Service
@RequiredArgsConstructor
public class WmsVmiBinService {

    private static final String DEFAULT_NO_PREFIX = "VBIN";
    private static final String DEFAULT_BIN_TYPE = "STORAGE";
    private static final String DEFAULT_BIN_STATUS = "IDLE";

    private final WmsVmiBinMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<WmsVmiBin> page(WmsVmiBinQuery query) {
        String keyword = query.getKeyword();
        Page<WmsVmiBin> page = mapper.selectPage(query.toPage(), Wrappers.<WmsVmiBin>lambdaQuery()
                .eq(StringUtils.hasText(query.getBinStatus()), WmsVmiBin::getBinStatus, query.getBinStatus())
                .eq(StringUtils.hasText(query.getBinType()), WmsVmiBin::getBinType, query.getBinType())
                .eq(StringUtils.hasText(query.getWarehouseCode()), WmsVmiBin::getWarehouseCode, query.getWarehouseCode())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsVmiBin::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(WmsVmiBin::getVmiBinNo, keyword).or()
                        .like(WmsVmiBin::getWarehouseCode, keyword).or()
                        .like(WmsVmiBin::getBinCode, keyword).or()
                        .like(WmsVmiBin::getMaterialCode, keyword).or()
                        .like(WmsVmiBin::getMaterialName, keyword))
                .orderByDesc(WmsVmiBin::getId));
        return PageResult.of(page);
    }

    public WmsVmiBin detail(Long id) {
        return require(id);
    }

    public Long save(Long id, WmsVmiBinSaveRequest request) {
        WmsVmiBin entity;
        if (id == null) {
            entity = new WmsVmiBin();
            entity.setVmiBinNo(StringUtils.hasText(request.getVmiBinNo())
                    ? request.getVmiBinNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setBinType(StringUtils.hasText(request.getBinType())
                    ? request.getBinType() : DEFAULT_BIN_TYPE);
            entity.setBinStatus(StringUtils.hasText(request.getBinStatus())
                    ? request.getBinStatus() : DEFAULT_BIN_STATUS);
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

    private WmsVmiBin require(Long id) {
        WmsVmiBin entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "VMI库位不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(WmsVmiBin entity, WmsVmiBinSaveRequest request) {
        if (StringUtils.hasText(request.getVmiBinNo())) {
            entity.setVmiBinNo(request.getVmiBinNo());
        }
        if (StringUtils.hasText(request.getBinType())) {
            entity.setBinType(request.getBinType());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getBinCode())) {
            entity.setBinCode(request.getBinCode());
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
        if (request.getCapacityQty() != null) {
            entity.setCapacityQty(request.getCapacityQty());
        }
        if (request.getPalletQty() != null) {
            entity.setPalletQty(request.getPalletQty());
        }
        if (request.getMaxPalletQty() != null) {
            entity.setMaxPalletQty(request.getMaxPalletQty());
        }
        if (StringUtils.hasText(request.getQrCode())) {
            entity.setQrCode(request.getQrCode());
        }
        if (StringUtils.hasText(request.getBinStatus())) {
            entity.setBinStatus(request.getBinStatus());
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
