package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpMaterialQuery;
import com.huaweicloud.plm.system.dto.ErpMaterialSaveRequest;
import com.huaweicloud.plm.system.entity.ErpMaterial;
import com.huaweicloud.plm.system.mapper.ErpMaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 基础资料—物料业务档案（G3-N1 ERP 基础资料 WBS T021）：
 * 物料档案登记、分页查询与删除。
 * 物料编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpMaterialService {

    private static final String DEFAULT_MATERIAL_NO_PREFIX = "EMAT";
    private static final String DEFAULT_BASE_UOM = "PCS";
    private static final String DEFAULT_VALUATION_METHOD = "MOVING_AVG";
    private static final String DEFAULT_MATERIAL_STATUS = "ACTIVE";

    private final ErpMaterialMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询物料档案：状态/物料组精确，编号/编码/名称模糊，按主键倒序。 */
    public PageResult<ErpMaterial> pageMaterials(ErpMaterialQuery query) {
        Page<ErpMaterial> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpMaterial>lambdaQuery()
                .eq(StringUtils.hasText(query.getMaterialStatus()),
                        ErpMaterial::getMaterialStatus, query.getMaterialStatus())
                .eq(StringUtils.hasText(query.getMaterialGroup()),
                        ErpMaterial::getMaterialGroup, query.getMaterialGroup())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpMaterial::getMaterialNo, query.getKeyword()).or()
                        .like(ErpMaterial::getMaterialCode, query.getKeyword()).or()
                        .like(ErpMaterial::getMaterialName, query.getKeyword()))
                .orderByDesc(ErpMaterial::getId));
        return PageResult.of(page);
    }

    public ErpMaterial detail(Long id) {
        return require(id);
    }

    /** 新增或更新物料档案：新增时回填默认基本单位/计价方式/状态/安全库存与组织，编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpMaterialSaveRequest request) {
        ErpMaterial entity;
        if (id == null) {
            entity = new ErpMaterial();
            entity.setMaterialNo(StringUtils.hasText(request.getMaterialNo())
                    ? request.getMaterialNo() : flowSupport.nextBizNo(DEFAULT_MATERIAL_NO_PREFIX));
            entity.setBaseUom(StringUtils.hasText(request.getBaseUom())
                    ? request.getBaseUom() : DEFAULT_BASE_UOM);
            entity.setValuationMethod(StringUtils.hasText(request.getValuationMethod())
                    ? request.getValuationMethod() : DEFAULT_VALUATION_METHOD);
            entity.setMaterialStatus(StringUtils.hasText(request.getMaterialStatus())
                    ? request.getMaterialStatus() : DEFAULT_MATERIAL_STATUS);
            entity.setSafetyStock(request.getSafetyStock() != null
                    ? request.getSafetyStock() : BigDecimal.ZERO);
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

    /** 删除物料档案：物理删除以释放物料编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpMaterial require(Long id) {
        ErpMaterial entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "物料业务档案不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpMaterial entity, ErpMaterialSaveRequest request) {
        if (StringUtils.hasText(request.getMaterialNo())) {
            entity.setMaterialNo(request.getMaterialNo());
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
        if (StringUtils.hasText(request.getMaterialGroup())) {
            entity.setMaterialGroup(request.getMaterialGroup());
        }
        if (StringUtils.hasText(request.getBaseUom())) {
            entity.setBaseUom(request.getBaseUom());
        }
        if (StringUtils.hasText(request.getPurchaseUom())) {
            entity.setPurchaseUom(request.getPurchaseUom());
        }
        if (StringUtils.hasText(request.getSaleUom())) {
            entity.setSaleUom(request.getSaleUom());
        }
        if (StringUtils.hasText(request.getValuationMethod())) {
            entity.setValuationMethod(request.getValuationMethod());
        }
        if (StringUtils.hasText(request.getDefaultWarehouseCode())) {
            entity.setDefaultWarehouseCode(request.getDefaultWarehouseCode());
        }
        if (StringUtils.hasText(request.getDefaultTaxCode())) {
            entity.setDefaultTaxCode(request.getDefaultTaxCode());
        }
        if (request.getSafetyStock() != null) {
            entity.setSafetyStock(request.getSafetyStock());
        }
        if (request.getStdCost() != null) {
            entity.setStdCost(request.getStdCost());
        }
        if (StringUtils.hasText(request.getMaterialStatus())) {
            entity.setMaterialStatus(request.getMaterialStatus());
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
