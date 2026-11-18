package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpBarcodeQuery;
import com.huaweicloud.plm.system.dto.ErpBarcodeSaveRequest;
import com.huaweicloud.plm.system.entity.ErpBarcode;
import com.huaweicloud.plm.system.mapper.ErpBarcodeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 条码管理—条码生成（对应 WBS G3-N7a ERP 条码管理）：
 * 条码登记、分页查询与删除。
 * 条码号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpBarcodeService {

    private static final String DEFAULT_BARCODE_NO_PREFIX = "BC";
    private static final String DEFAULT_BARCODE_TYPE = "MATERIAL";
    private static final String DEFAULT_PRINT_STATUS = "UNPRINTED";

    private final ErpBarcodeMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询条码：类型/打印状态/业务单号精确，条码号/业务单号/物料编码/物料名称模糊，按主键倒序。 */
    public PageResult<ErpBarcode> page(ErpBarcodeQuery query) {
        Page<ErpBarcode> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpBarcode>lambdaQuery()
                .eq(StringUtils.hasText(query.getBarcodeType()),
                        ErpBarcode::getBarcodeType, query.getBarcodeType())
                .eq(StringUtils.hasText(query.getPrintStatus()),
                        ErpBarcode::getPrintStatus, query.getPrintStatus())
                .eq(StringUtils.hasText(query.getBizNo()),
                        ErpBarcode::getBizNo, query.getBizNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpBarcode::getBarcodeNo, query.getKeyword()).or()
                        .like(ErpBarcode::getBizNo, query.getKeyword()).or()
                        .like(ErpBarcode::getMaterialCode, query.getKeyword()).or()
                        .like(ErpBarcode::getMaterialName, query.getKeyword()))
                .orderByDesc(ErpBarcode::getId));
        return PageResult.of(page);
    }

    public ErpBarcode detail(Long id) {
        return require(id);
    }

    /** 新增或更新条码：新增时回填默认条码类型/数量/打印状态与打印次数及组织，条码号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpBarcodeSaveRequest request) {
        ErpBarcode entity;
        if (id == null) {
            entity = new ErpBarcode();
            entity.setBarcodeNo(StringUtils.hasText(request.getBarcodeNo())
                    ? request.getBarcodeNo() : flowSupport.nextBizNo(DEFAULT_BARCODE_NO_PREFIX));
            entity.setBarcodeType(StringUtils.hasText(request.getBarcodeType())
                    ? request.getBarcodeType() : DEFAULT_BARCODE_TYPE);
            entity.setQty(request.getQty() != null
                    ? request.getQty() : BigDecimal.ZERO);
            entity.setPrintStatus(StringUtils.hasText(request.getPrintStatus())
                    ? request.getPrintStatus() : DEFAULT_PRINT_STATUS);
            entity.setPrintCount(request.getPrintCount() != null
                    ? request.getPrintCount() : 0);
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

    /** 删除条码：物理删除以释放条码号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpBarcode require(Long id) {
        ErpBarcode entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "条码不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpBarcode entity, ErpBarcodeSaveRequest request) {
        if (StringUtils.hasText(request.getBarcodeNo())) {
            entity.setBarcodeNo(request.getBarcodeNo());
        }
        if (StringUtils.hasText(request.getBarcodeType())) {
            entity.setBarcodeType(request.getBarcodeType());
        }
        if (StringUtils.hasText(request.getBizNo())) {
            entity.setBizNo(request.getBizNo());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (request.getQty() != null) {
            entity.setQty(request.getQty());
        }
        if (StringUtils.hasText(request.getUnit())) {
            entity.setUnit(request.getUnit());
        }
        if (StringUtils.hasText(request.getRuleCode())) {
            entity.setRuleCode(request.getRuleCode());
        }
        if (StringUtils.hasText(request.getTemplateCode())) {
            entity.setTemplateCode(request.getTemplateCode());
        }
        if (StringUtils.hasText(request.getPrintStatus())) {
            entity.setPrintStatus(request.getPrintStatus());
        }
        if (request.getPrintCount() != null) {
            entity.setPrintCount(request.getPrintCount());
        }
        if (request.getPrintTime() != null) {
            entity.setPrintTime(request.getPrintTime());
        }
        if (StringUtils.hasText(request.getPrinter())) {
            entity.setPrinter(request.getPrinter());
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
