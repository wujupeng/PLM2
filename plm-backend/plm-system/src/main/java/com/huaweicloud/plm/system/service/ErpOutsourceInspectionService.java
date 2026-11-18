package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpOutsourceInspectionQuery;
import com.huaweicloud.plm.system.dto.ErpOutsourceInspectionSaveRequest;
import com.huaweicloud.plm.system.entity.ErpOutsourceInspection;
import com.huaweicloud.plm.system.mapper.ErpOutsourceInspectionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 委外管理—委外报检单（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）：
 * 委外报检登记、分页查询与删除。
 * 报检单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpOutsourceInspectionService {

    private static final String DEFAULT_INSPECTION_NO_PREFIX = "OSQ";
    private static final String DEFAULT_INSPECTION_TYPE = "FULL";
    private static final String DEFAULT_INSPECTION_RESULT = "PENDING";
    private static final String DEFAULT_INSPECTION_STATUS = "OPEN";

    private final ErpOutsourceInspectionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询委外报检单：状态/检验结果/到货单号/物料编码精确，单号/物料编码模糊，按主键倒序。 */
    public PageResult<ErpOutsourceInspection> page(ErpOutsourceInspectionQuery query) {
        Page<ErpOutsourceInspection> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpOutsourceInspection>lambdaQuery()
                .eq(StringUtils.hasText(query.getInspectionStatus()),
                        ErpOutsourceInspection::getInspectionStatus, query.getInspectionStatus())
                .eq(StringUtils.hasText(query.getInspectionResult()),
                        ErpOutsourceInspection::getInspectionResult, query.getInspectionResult())
                .eq(StringUtils.hasText(query.getReceiptNo()),
                        ErpOutsourceInspection::getReceiptNo, query.getReceiptNo())
                .eq(StringUtils.hasText(query.getMaterialCode()),
                        ErpOutsourceInspection::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpOutsourceInspection::getInspectionNo, query.getKeyword()).or()
                        .like(ErpOutsourceInspection::getMaterialCode, query.getKeyword()))
                .orderByDesc(ErpOutsourceInspection::getId));
        return PageResult.of(page);
    }

    public ErpOutsourceInspection detail(Long id) {
        return require(id);
    }

    /** 新增或更新委外报检单：新增时回填默认检验类型/结果/状态/数量与组织，报检单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpOutsourceInspectionSaveRequest request) {
        ErpOutsourceInspection entity;
        if (id == null) {
            entity = new ErpOutsourceInspection();
            entity.setInspectionNo(StringUtils.hasText(request.getInspectionNo())
                    ? request.getInspectionNo() : flowSupport.nextBizNo(DEFAULT_INSPECTION_NO_PREFIX));
            entity.setInspectionType(StringUtils.hasText(request.getInspectionType())
                    ? request.getInspectionType() : DEFAULT_INSPECTION_TYPE);
            entity.setInspectionResult(StringUtils.hasText(request.getInspectionResult())
                    ? request.getInspectionResult() : DEFAULT_INSPECTION_RESULT);
            entity.setInspectionStatus(StringUtils.hasText(request.getInspectionStatus())
                    ? request.getInspectionStatus() : DEFAULT_INSPECTION_STATUS);
            entity.setInspectionQty(request.getInspectionQty() != null
                    ? request.getInspectionQty() : BigDecimal.ZERO);
            entity.setQualifiedQty(request.getQualifiedQty() != null
                    ? request.getQualifiedQty() : BigDecimal.ZERO);
            entity.setRejectedQty(request.getRejectedQty() != null
                    ? request.getRejectedQty() : BigDecimal.ZERO);
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

    /** 删除委外报检单：物理删除以释放报检单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpOutsourceInspection require(Long id) {
        ErpOutsourceInspection entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "委外报检单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpOutsourceInspection entity, ErpOutsourceInspectionSaveRequest request) {
        if (StringUtils.hasText(request.getInspectionNo())) {
            entity.setInspectionNo(request.getInspectionNo());
        }
        if (StringUtils.hasText(request.getReceiptNo())) {
            entity.setReceiptNo(request.getReceiptNo());
        }
        if (StringUtils.hasText(request.getOrderNo())) {
            entity.setOrderNo(request.getOrderNo());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getInspectionType())) {
            entity.setInspectionType(request.getInspectionType());
        }
        if (request.getInspectionQty() != null) {
            entity.setInspectionQty(request.getInspectionQty());
        }
        if (request.getQualifiedQty() != null) {
            entity.setQualifiedQty(request.getQualifiedQty());
        }
        if (request.getRejectedQty() != null) {
            entity.setRejectedQty(request.getRejectedQty());
        }
        if (StringUtils.hasText(request.getInspectionResult())) {
            entity.setInspectionResult(request.getInspectionResult());
        }
        if (StringUtils.hasText(request.getInspector())) {
            entity.setInspector(request.getInspector());
        }
        if (request.getInspectionDate() != null) {
            entity.setInspectionDate(request.getInspectionDate());
        }
        if (StringUtils.hasText(request.getInspectionStatus())) {
            entity.setInspectionStatus(request.getInspectionStatus());
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
